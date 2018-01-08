var getHsrStatus = function (obj, settingsConf, isSave, hsrCb) {
  $async.parallel({
    hsr: function (mainCb) {
      var hsrQuery = { "orgId": obj.orgId };

      $healthstatusrules._get(hsrQuery, {}, function (hsrRules) {
        mainCb(null, hsrRules);
      });
    },
    members: function (mainCb) {
      var memQuery = {};

      if (obj.hasOwnProperty("memberId")) {
        memQuery["_id"] = obj.memberId;
      } else {
        memQuery["appId"] = obj.appId;
        memQuery["locationId"] = obj.locationId;
      }

      /*var memQuery = {
        "appId": appId,
        "locationId": locationId
      }*/

      var memOptions = {};
      memOptions.sort = [['firstName', 'asc']];

      $member._getMember(memQuery, memOptions, function (members) {
        var memberIds = members && members.length > 0 ? _.pluck(members, "_id") : [];
        mainCb(null, memberIds);
      });
    },
    procedureMapped: function (mainCb) {
      var procMapquery = {
        "appId": $db.objectId(obj.appId)
      };

      $procedure._getMemberProcedureMapped(procMapquery, function (mappedList) {
        mappedList = mappedList && mappedList.length > 0 ? $general.convertToJsonObject(mappedList) : [];
        mainCb(null, mappedList);
      });
    },
  }, function (err, results) {
    $async.waterfall([
      function (mhCb) {
        results["procedures"] = [];

        if (results.procedureMapped.length > 0 && results.members.length > 0) {
          var currMemberIds = results.members.length > 0 ? _.map(results.members, id => id.toString()) : [];

          results.procedureMapped = _.filter(results.procedureMapped, function (procObj) {
            return currMemberIds.indexOf(procObj.memberId) > -1;
          });

          if (results.procedureMapped.length > 0) {
            var procedureIds = _.uniq(_.pluck(results.procedureMapped, "procedureId"));

            var procdQuery = {
              "_id": procedureIds
            };

            $procedure._getProcedure(procdQuery, {}, function (procedures) {
              results["procedures"] = procedures && procedures.length > 0 ? $general.convertToJsonObject(procedures) : [];
              mhCb(null, results);
            });
          } else {
            mhCb(null, results);
          }
        } else {
          mhCb(null, results);
        }
      }, function (procDatas, mhCb) {
        procDatas["memberBlockData"] = {};

        if (procDatas.hsr.length > 0) {
          var tileIds = [];

          _.each(procDatas.hsr, function (hsrEngine, index) {
            if (hsrEngine.tileId && hsrEngine.tileId.length > 0) {
              tileIds = _.union(tileIds, hsrEngine.tileId);
            }
          });

          tileIds = _.map(tileIds, id => $db.objectId(id));

          var memBlockQuery = {};
          memBlockQuery["appId"] = $db.objectId(obj.appId);
          memBlockQuery["tileId"] = { $in: tileIds };
          memBlockQuery["memberId"] = { $in: procDatas.members };

          var memberBlockFields = { _id: 1, appId: 1, memberId: 1, tileId: 1, locationId: 1, tileBlockId: 1, procedureMappingId: 1, data: 1, days: 1 };

          $memberblockdata.getSpecificFields(memberBlockFields, memBlockQuery, {}, function (mbDatas) {
            if (mbDatas && mbDatas.length > 0) {
              mbDatas = $general.convertToJsonObject(mbDatas);

              procDatas["memberBlockData"] = mbDatas.reduce((result, current) => {
                var memberId = current.memberId;
                delete current["memberId"];
                result[memberId] = result[memberId] || [];
                result[memberId].push(current);
                return result;
              }, {});
            }
            mhCb(null, procDatas);
          });
        } else {
          mhCb(null, procDatas);
        }
      }], function (error, results) {
        var hsrResults = processHsrResults(results);

        if (isSave) {
          saveHsrStatus(hsrResults, settingsConf, obj)
        }

        if (hsrCb) {
          hsrCb(hsrResults);
        }
      });
  });
};

var processHsrResults = function (hsrProcDatas) {
  var memberHsrResult = {};
  hsrProcDatas.members = hsrProcDatas.members.length > 0 ? _.map(hsrProcDatas.members, id => id.toString()) : [];

  if (hsrProcDatas.members.length > 0) {
    _.each(hsrProcDatas.members, function (memId, index) {
      var currMemProcMapped = _.filter(hsrProcDatas.procedureMapped, function (procObj) {
        return procObj.memberId == memId;
      });

      var procedureIds = _.uniq(_.pluck(currMemProcMapped, "procedureId"));

      var currProcedures = _.filter(hsrProcDatas.procedures, function (procObj) {
        return procedureIds.indexOf(procObj._id) > -1;
      });

      var procedureMappedIds = currMemProcMapped.length > 0 ? _.pluck(currMemProcMapped, "_id") : [];

      var mappedTileIds = [];

      _.each(currProcedures, function (curProc, index) {
        if (curProc.tiles && curProc.tiles.length > 0) {
          mappedTileIds = _.union(mappedTileIds, _.pluck(curProc.tiles, "_id"));
        }
      });

      if (!__util.isEmptyObject(hsrProcDatas.memberBlockData) && hsrProcDatas.memberBlockData.hasOwnProperty(memId) && hsrProcDatas.memberBlockData[memId].length > 0) {
        memberHsrResult[memId] = statusHsr(hsrProcDatas, memId, procedureMappedIds, mappedTileIds);
      }
    });
  }

  return memberHsrResult;
};

var saveHsrStatus = function (hsrResults, settingsConf, obj) {
  if (!__util.isEmptyObject(hsrResults)) {
    $async.waterfall([
      function (callback) {
        options = {};

        var currMemberIds = Object.keys(hsrResults);
        var memIds = _.map(currMemberIds, x => $db.objectId(x));

        var statusQuery = { memberId: { $in: memIds } };

        $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.hsrstatus, statusQuery, {}, function (result) {
          result = result && result.length > 0 ? $general.convertToJsonObject(result) : [];
          callback(null, result, memIds);
        });
      }], function (err, memExists, memIds) {
        if (memIds && memIds.length > 0) {
          var memsToRemove = [];
          _.each(memIds, function (memberId, index) {
            var statusObj = hsrResults[memberId];

            if (!__util.isEmptyObject(statusObj)) {
              var currMemExists = _.filter(memExists, function (memObj) {
                return memObj.memberId == memberId;
              });

              if (currMemExists.length > 0) {
                var updateQuery = {};
                updateQuery._id = currMemExists[0]._id;
                var dataToUpdate = getHsrObj(statusObj, obj, memberId);

                $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.hsrstatus, updateQuery, {}, dataToUpdate, function (result) {
                  return;
                });
              } else {
                var dataSave = getHsrObj(statusObj, obj, memberId);

                $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.hsrstatus, dataSave, function (result) {

                  return;
                });
              }
            } else {
              var currMemExists = _.filter(memExists, function (memObj) {
                return memObj.memberId == memberId;
              });

              if (currMemExists.length > 0) {
                memsToRemove.push(memberId);
              }
            }
          });

          if (memsToRemove.length > 0) {
            hsrStatusRemove(settingsConf, memsToRemove);
          }
        }
      });
  }
};

var hsrStatusRemove = function (settingsConf, memsToRemove) {
  _.each(memsToRemove, function (memberId, index) {
    var removeQuery = { "memberId": $db.objectId(memberId) };

    $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.hsrstatus, removeQuery, {}, function (result) {

    });
  });
};

module.exports = {
  "getHsrStatus": getHsrStatus
}
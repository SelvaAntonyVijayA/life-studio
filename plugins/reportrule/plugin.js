var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.reportrule, obj, function (result) {
    var resultObj = { "_id": result };
    res.send(resultObj);
  });
};

var getall = function (req, res, next) {
  $async.parallel({
    tiles: function (cb) {
      query = {};
      query.organizationId = req.params.orgId;

      $tile.getSpecificFields({}, query, {}, function (tiles) {
        cb(null, tiles);
      });
    },
    apptiles: function (cb) {
      $page.getAllTileIdsAssignedToApp(req.params.orgId, function (pages) {
        cb(null, pages);
      });
    }
  }, function (err, result) {
    res.send({
      tiles: result.tiles,
      apptiles: result.apptiles
    });
  });
};

var list = function (req, res, next) {
  query = {};

  if (!__util.isNullOrEmpty(req.params.ruleId)) {
    query["_id"] = req.params.ruleId;
  }

  query["organizationId"] = req.params.orgId;

  options = {};
  options.sort = [['dateUpdated', 'desc']];

  get(query, options, function (result) {
    res.send(result);
  });
};

var get = function (rQuery, rOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.reportrule, rQuery, rOptions, function (result) {
    cb(result);
  })
};

var deleteRule = function (req, res, next) {
  query = {};
  options = {};
  query["_id"] = req.params.ruleId;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.reportrule, query, options, function (result) {
    var deleteResult = { "deleted": result };

    res.send(deleteResult);
  });
};

var averageReport = function (req, res, next) {
  var obj = req.body.form_data;

  $async.waterfall([
    function (callback) {
      $async.parallel({
        blocks: function (cb) {
          var memBlockQuery = {
            "appId": $db.objectId(obj.appId),
            "tileBlockId": {
              "$in": $general._getObjectIds(obj.tileBlockIds)
            }
          };

          if (obj.hasOwnProperty("startTime") && obj.hasOwnProperty("endTime")) {
            memBlockQuery.updatedDate = {
              $gte: new Date(obj.startTime),
              $lte: new Date(obj.endTime)
            };
          };

          $memberblockdata._blockData(memBlockQuery, {}, function (blocks) {
            cb(null, $general.convertToJsonObject(blocks));
          });
        },
        procedure: function (cb) {
          if (!__util.isNullOrEmpty(obj.procedureId)) {
            var procquery = {
              _id: obj.procedureId
            };

            $procedure._getProcedure(procquery, {}, function (procedure) {
              cb(null, $general.convertToJsonObject(procedure));
            });
          } else {
            cb(null, []);
          }
        }
      }, function (err, result) {
        callback(null, result.blocks, result.procedure);
      });
    },
    function (blocks, procedure, callback) {
      var groupResult = {};

      if (blocks && blocks.length > 0) {
        if (!__util.isNullOrEmpty(obj.memberId)) {
          var memberBlocks = _.filter(blocks, function (bd) {
            return bd.memberId == obj.memberId;
          });

          groupResult.patientData = memberBlocks;
        }

        groupResult.averageData = groupByTilesAnswerCount(blocks, obj);
        groupResult.procedure = procedure;

        callback(null, groupResult);

      } else {
        callback(null, {});
      }
    }], function (error, result) {
      res.send(result);
    });
};

var groupByTilesAnswerCount = function (blocks, dataObj) {
  var answersByTile = {};
  var cascadingBlocks = dataObj && dataObj.cascadingBlocks && !__util.isEmptyObject(dataObj.cascadingBlocks) ? dataObj.cascadingBlocks : {};

  _.each(blocks, function (mblock, index) {
    var tileKey = mblock.tileId;
    var blckId = mblock.tileBlockId.toString();
    var isCascadeBlck = !__util.isEmptyObject(cascadingBlocks) && cascadingBlocks.hasOwnProperty(blckId) ? true : false;
    var cascadeAnswerIndex = "-1";

    if (!answersByTile[tileKey]) {
      answersByTile[tileKey] = {};
    }

    var answers = [];

    if (!isCascadeBlck) {
      answers = mblock && mblock.data && mblock.data.answers ? mblock.data.answers : [];

    } else {
      cascadeAnswerIndex = cascadingBlocks[blckId];
      var ansObj = _getCascadingQuesByLevel(mblock, cascadeAnswerIndex);

      if (ansObj.result) {
        answers = ansObj.answers;
      }
    }

    _.each(answers, function (ans, index) {
      var currAns = parseInt(ans);

      if (!answersByTile[tileKey].hasOwnProperty(currAns)) {
        answersByTile[tileKey][currAns] = 1;

      } else {
        answersByTile[tileKey][currAns] = answersByTile[tileKey][currAns] + 1;
      }
    });
  });

  return answersByTile;
};

var _getCascadingQuesByLevel = function (mblock, cascadeAnswerIndex) {
  var resultObj = { result: true, answers: [] };
  var answer = mblock && mblock.data && mblock.data.answers && mblock.data.answers.length > 0 ? mblock.data.answers : []

  var levels = cascadeAnswerIndex.split("_");
  var currObj = {};

  if (levels.length > 1) {
    for (var j = 0; j < levels.length; j++) {
      var pLevel = parseInt(levels[j]);

      if (j == 0) {
        currObj = matchAnswerLevel(answer, pLevel, 'answer');

        if (currObj == "") {
          resultObj.result = false;
          return false;
        }
      } else {
        if (j == 1) {
          currObj = currObj.subAnswers[pLevel];

          if (typeof currObj == "undefined" || __util.isEmptyObject(currObj)) {
            resultObj.result = false;
            return false;
          }
        } else if (j == 2) {
          currObj = matchAnswerLevel(currObj.subAnswers, pLevel, 'subAnswer');

          if (currObj == "") {
            resultObj.result = false;
            return false;
          }
        }
      }
    }
  } else if (levels.length == 1) {
    resultObj.result = answer && answer.length > 0 ? true : false;

  } else {
    resultObj.result = false;
  }

  if (resultObj.result) {
    if (levels.length == 1) {
      var dataAnswers = [];
      resultObj.result = answer && answer.length > 0 ? true : false;

      if (resultObj.result) {
        _.filter(answer, function (elem) {
          resultObj.answers.push(elem.answer);
        });
      }
    } else if (levels.length == 2) {
      resultObj.result = currObj && currObj.subAnswers && currObj.subAnswers.length > 0 ? true : false;

      if (resultObj.result) {
        _.filter(currObj.subAnswers, function (elem) {
          resultObj.answers.push(elem.subAnswer);
        });
      }
    } else if (levels.length == 3) {
      resultObj.result = currObj && currObj.optionAnswers[0] && currObj.optionAnswers[0].subAnswers && currObj.optionAnswers[0].subAnswers.length > 0 ? true : false;

      if (resultObj.result) {
        _.filter(currObj.optionAnswers[0].subAnswers, function (elem) {
          resultObj.answers.push(elem.subAnswer);
        });
      }
    }
  }

  return resultObj;
};

var matchAnswerLevel = function (a, pLevel, propName) {
  var result = "";

  if (a && a.length > 0) {
    var i = a.length;
    while (i--) {
      if (a[i][propName] == pLevel) {
        return a[i];
      }
    }
  }

  return result;
};

var groupByAnswerCount = function (answers, groupResult) {
  _.each(answers, function (ans, index) {
    var currAns = parseInt(ans);

    if (!groupResult.hasOwnProperty(currAns)) {
      groupResult[currAns] = 1;
    } else {
      groupResult[currAns] = groupResult[currAns] + 1;
    }
  });
};

var getReport = function (req, res, next) {
  var obj = req.body.form_data;

  $async.waterfall([
    function (callback) {
      var memBlockQuery = {
        "appId": $db.objectId(obj.appId),
        "tileBlockId": {
          "$in": $general._getObjectIds(obj.tileBlockIds)
        }
      };

      if (obj.hasOwnProperty("startTime") && obj.hasOwnProperty("endTime")) {
        memBlockQuery.updatedDate = {
          $gte: new Date(obj.startTime),
          $lte: new Date(obj.endTime)
        };
      };

      if (obj.hasOwnProperty("memberId")) {
        memBlockQuery.memberId = $db.objectId(obj.memberId);
      }

      $memberblockdata._blockData(memBlockQuery, {}, function (blocks) {
        callback(null, blocks);
      });
    },
    function (blocks, callback) {
      var groupResult = {};

      if (blocks && blocks.length > 0) {
        if (!obj.hasOwnProperty("memberId")) {
          _.each(blocks, function (blck, index) {
            var answers = blck && blck.data && blck.data.answers ? blck.data.answers : [];
            groupByAnswerCount(answers, groupResult);
          });
        }

        var resultObj = !obj.hasOwnProperty("memberId") ? groupResult : blocks;
        callback(null, resultObj);
      } else {
        callback(null, {});
      }
    }], function (error, result) {
      res.send(result);
    });
};

module.exports = {
  "init": init,
  "save": save,
  "getall": getall,
  "list": list,
  "get": get,
  "deleteRule": deleteRule,
  "averageReport": averageReport,
  "getReport": getReport
};
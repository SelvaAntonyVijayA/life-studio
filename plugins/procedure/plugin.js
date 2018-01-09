var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;
  obj = _setProcedureObj(obj);

  $async.waterfall([
    function (callback) {
      var options = {};

      if (__util.isNullOrEmpty(obj._id)) {
        var tokenObj = $authtoken.get(req.cookies.token);
        obj.createdBy = tokenObj.uid;

        $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.procedure, obj, function (result) {
          obj._id = result;
          $tilestatus.saveHsrByOrg(req.cookies.token);
          callback(null, obj);
        });

      } else {
        query = {};
        query._id = obj._id.toString();

        _getProcedure(query, options, function (procedureObj) {
          if (procedureObj.length > 0) {
            options = {};
            delete obj["_id"];

            updateProcedure(query, options, obj, function (result) {
              obj._id = query._id;
              $tilestatus.saveHsrByOrg(req.cookies.token);
              callback(null, procedureObj);
            });

          } else {
            callback(null, procedureObj);
          }
        });
      }
    },
    function (procedureObj, callback) {
      _getTileUpdate(obj, procedureObj, function (datasPush, datasPull) {
        callback(null, datasPush, datasPull);
      });

    },
    function (datasPush, datasPull, callback) {
      _updateTileIds(datasPush, datasPull, function () {
        callback(null);
      });

    }], function (err) {
      var result = {};
      result._id = obj._id;

      res.send(result);
    });
};

var list = function (req, res, next) {
  var dtype = req.query.dtype;

  $async.waterfall([
    function (callback) {
      query = {};
      options = {};

      if (!__util.isNullOrEmpty(req.params.orgId)) {
        query.organizationId = req.params.orgId;
      }

      if (!__util.isNullOrEmpty(req.params.procedureId)) {
        query._id = req.params.procedureId;
      }

      if (!__util.isNullOrEmpty(dtype)) {
        query.type = dtype;
      }

      _getProcedure(query, options, function (procedures) {
        callback(null, procedures);
      });
    },
    function (procedures, callback) {
      if (__util.isNullOrEmpty(req.params.orgId)) {
        callback(null, procedures, []);

      } else {
        options = {};
        var roleQuery = {};
        roleQuery.orgId = req.params.orgId;

        $page.isRoleGroup(roleQuery, options, (dtype ? dtype : "procedure"), function (groups) {
          callback(null, procedures, groups);
        });
      }
    },
    function (procedures, groups, callback) {
      procedures.forEach(function (procedure) {
        var isRole = _.findWhere(groups, {
          "linkTo": (dtype ? dtype : "procedure"),
          "linkId": procedure._id.toString()
        });

        if (isRole) {
          procedure.isRoleBased = true;

        } else {
          procedure.isRoleBased = false;
        }
      });

      callback(null, procedures);
    }], function (err, procedures) {
      res.send(procedures);
    });
};

var getByTiles = function (req, res, next) {
  var procedureId = req.params.procedureId;

  $async.waterfall([
    function (callback) {
      query = { "_id": procedureId };
      options = {};

      _getProcedure(query, options, function (procedure) {
        callback(null, procedure);
      });
    },
    function (procedure, callback) {
      if (procedure && procedure[0] && procedure[0].hasOwnProperty("tiles") && procedure[0].tiles.length > 0) {
        var tileIds = [];

        _.each(procedure[0].tiles, function (tile) {
          tileIds.push(tile._id)
        });

        if (tileIds.length > 0) {
          query = { "_id": tileIds };
          options = {};

          var tileFields = {
            "_id": 1, "title": 1, "art": 1, "notification": 1,
            "smart": 1,
            "Apps": 1,
            "Procedure": 1,
            "hsrRuleEngine": 1,
            "isWeight": 1,
            "isRoleBased": 1
          };

          $tile.getSpecificFields(tileFields, query, options, function (tiles) {
            tiles = $general.convertToJsonObject(tiles);

            _.each(tileIds, function (id) {
              var tileObj = _.findWhere(tiles, {
                _id: id
              });

              if (tileObj) {
                var tileResult = _.findWhere(procedure[0].tiles, {
                  "_id": tileObj._id
                });

                tileResult["tileData"] = tileObj;
              }
            });
            callback(null, procedure);
          });
        } else {
          callback(null, procedure);
        }
      } else {
        callback(null, procedure);
      }
    }], function (err, result) {
      res.send(result);
    });
};

var _getProcedure = function (pQuery, pOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.procedure, pQuery, pOptions, function (procedures) {
    cb(procedures);
  });
};

var updateProcedure = function (pQuery, pOptions, dataToUpdate, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.procedure, pQuery, pOptions, dataToUpdate, function (result) {
    cb(result);
  });
};

var _getTileUpdate = function (procedure, updatedProcedure, done) {
  var updatedTiles = updatedProcedure && updatedProcedure.length > 0 && !__util.isEmptyObject(updatedProcedure[0].tiles) ? updatedProcedure[0].tiles : [];
  var tiles = procedure && !__util.isEmptyObject(procedure.tiles) ? procedure.tiles : [];
  var proceduceData = !__util.isEmptyObject(procedure) ? procedure : {};
  var pushTile = [];
  var pullTile = [];

  _.each(tiles, function (tile) {
    var tileExists = _.findWhere(pushTile, {
      "tileId": tile._id
    });

    var data = {};
    data.tileId = tile._id;
    //delete tile["_id"]

    var proc = {};
    proc.procId = proceduceData._id.toString();
    proc.name = proceduceData.name;
    proc.triggerData = tile;

    data.Procedure = proc;

    if (!tileExists) {
      pushTile.push(data);
    }
  });

  _.each(updatedTiles, function (tile) {
    var _tileId = !__util.isNullOrEmpty(tile._id) ? tile._id.toString() : tile._id;

    var updatedExists = _.findWhere(tiles, {
      "_id": _tileId
    });

    var data = {};
    data.tileId = tile._id;

    var pullExists = _.findWhere(pullTile, {
      "tileId": _tileId
    });
    delete tile["_id"];

    var proc = {};

    if (!__util.isEmptyObject(proceduceData)) {
      proc.procId = proceduceData._id.toString();
      proc.name = proceduceData.name;
    }

    proc.triggerData = tile;

    data.Procedure = proc;

    if (!updatedExists && !pullExists) {
      pullTile.push(data);
    }
  });

  done(pushTile, pullTile);
};

var _setProcedureObj = function (procedure) {
  if (!__util.isNullOrEmpty(procedure.dateCreated)) {
    procedure.dateCreated = $general.stringToDate(procedure.dateCreated);
  }

  if (!__util.isNullOrEmpty(procedure.dateUpdated)) {
    procedure.dateUpdated = $general.stringToDate(procedure.dateUpdated);
  } else {
    procedure.dateUpdated = $general.getIsoDate();
  }

  if (!__util.isNullOrEmpty(procedure.triggeron)) {
    procedure.triggeron = $general.stringToDate(procedure.triggeron);
  }

  if (!__util.isNullOrEmpty(procedure.updatedOn)) {
    procedure.updatedOn = $general.stringToDate(procedure.updatedOn);
  }

  if (!__util.isNullOrEmpty(procedure.createdOn)) {
    procedure.createdOn = $general.stringToDate(procedure.createdOn);
  }

  if (!__util.isNullOrEmpty(procedure.triggeron)) {
    procedure.triggeron = $general.stringToDate(procedure.triggeron);
  }

  if (!__util.isNullOrEmpty(procedure.noteUpdated)) {
    procedure.noteUpdated = $general.stringToDate(procedure.noteUpdated);
  }

  if (procedure.procedures) {
    _.each(procedure.procedures, function (data, index) {
      if (!__util.isNullOrEmpty(data.triggeron)) {
        procedure.procedures[index].triggeron = $general.stringToDate(data.triggeron);
      }
    });
  }

  if (procedure.notes) {
    _.each(procedure.notes, function (data, index) {
      if (!__util.isNullOrEmpty(data.datetime)) {
        procedure.notes[index].datetime = $general.stringToDate(data.datetime);
      }
    });
  }

  return procedure;
};

var _updateTileIds = function (pushTiles, pullTiles, cb) {
  $async.parallel({
    push: function (callback) {
      $async.each(pushTiles, function (tile, done) {
        query = {};
        query._id = tile.tileId;

        _updateTile(query, tile.Procedure, "push", function () {
          done();
        });

      }, function () {
        callback(null);
      });
    },
    pull: function (callback) {
      $async.each(pullTiles, function (tile, done) {
        query = {};
        query._id = tile.tileId;

        _updateTile(query, tile.Procedure, "pull", function () {
          done();
        });

      }, function () {
        callback(null);
      });

    }
  }, function (err, results) {
    if (cb) {
      cb();
    }
  });
};

var _updateTile = function (tileQuery, data, updateType, cb) {
  obj = {};

  $async.waterfall([
    function (callback) {
      $tile._getTiles(tileQuery, function (tileObj) {
        callback(null, tileObj);
      });

    },
    function (tileObj, callback) {
      var procedures = tileObj && tileObj.length > 0 && !__util.isEmptyObject(tileObj[0].Procedure) ? tileObj[0].Procedure : [];

      if (updateType == "push") {
        var index = getIndexByArray(procedures, "procId", data.procId);

        if (index == -1) {
          procedures.push(data);
        } else {
          procedures[index] = data;
        }

        updatedProcedure = procedures;

      } else {
        var index = getIndexByArray(procedures, "procId", data.procId);

        if (index == -1) {
          procedures.push(data);
        } else {
          procedures[index] = data;
        }

        procedures.splice(index, 1);
      }

      callback(null, procedures);

    }], function (err, procedure) {
      var obj = {};
      obj.Procedure = procedure;

      $tile.tileUpdate(tileQuery, {
        multi: true
      }, obj, function (result) {
        cb(result);
      });
    });
};

var getIndexByArray = function (obj, key, value) {
  for (var i = 0; i < obj.length; i++) {
    if (obj[i][key] == value) {
      return i;
    }
  }

  return -1;
};

var _getMemberProcedureMapped = function (pQuery, cb) {
  options = {};
  options.sort = [['_id', 'desc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.procedure, settingsConf.collections.memberproceduremapping, pQuery, options, function (mappedProcedures) {
    cb(mappedProcedures);
  });
};

var remove = function (req, res, next) {
  var obj = {};

  $async.waterfall([
    function (callback) {
      query = {};
      query._id = req.params.procedureId;

      _getProcedure(query, options, function (procedureObj) {
        callback(null, procedureObj);
      });
    },
    function (procedureObj, callback) {
      obj._id = procedureObj[0]._id.toString();
      obj.name = procedureObj[0].name;

      _getTileUpdate(obj, procedureObj, function (datasPush, datasPull) {
        callback(null, datasPush, datasPull);
      });

    },
    function (datasPush, datasPull, callback) {
      _updateTileIds(datasPush, datasPull, function () {
        callback(null);
      });

    }], function (err) {
      query = {};
      query._id = req.params.procedureId;

      $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.procedure, query, options, function (result) {
        obj = {};
        obj.deleted = result;
        $tilestatus.saveHsrByOrg(req.cookies.token);

        res.send(obj);
      });
    });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "getByTiles": getByTiles,
  "_getProcedure": _getProcedure,
  "updateProcedure": updateProcedure,
  "_getMemberProcedureMapped": _getMemberProcedureMapped,
  "remove": remove
};
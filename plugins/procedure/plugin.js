var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  var dtype = req.query.dtype;

  console.dir(dtype);

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
                var tileResult = _.findWhere(event[0].tiles, {
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

module.exports = {
  "init": init,
  "list": list,
  "getByTiles": getByTiles,
  "_getProcedure": _getProcedure
};
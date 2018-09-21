var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function(req, res, next){
  var obj = {};

  if (!__util.isEmptyObject(req.body.form_data)) {
    obj = req.body.form_data;
    obj = _setTilistObj(obj);
  }

  if (!obj.hasOwnProperty("_id")) {
    var tokenObj = $authtoken.get(req.cookies.token);
    obj.createdBy = tokenObj.uid;

    $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.tilist, obj, function (result) {
      obj = {};
      obj._id = result;

      res.send(obj);
    });
  } else if(obj.hasOwnProperty("_id")) {
    options = {};
    query = {};
    query._id = obj._id;
    delete obj["_id"];

    console.dir(query);
    console.dir(obj);

    updateTilist(query, options, obj, function (result) {
      obj = {};
      obj._id = query._id;

      res.send(obj);
    });
  }
};

var list = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      query = {};
      options = {};

      if (!__util.isNullOrEmpty(req.params.orgId)) {
        query.organizationId = req.params.orgId;
      }

      if (!__util.isNullOrEmpty(req.params.tilistId)) {
        query._id = req.params.tilistId;
      }

      _getFolder(query, function (tilist) {
        callback(null, tilist);
      });
    },
    function (tilist, callback) {
      if (__util.isNullOrEmpty(req.params.orgId)) {
        callback(null, tilist, []);
      } else {
        options = {};
        var roleQuery = {};
        roleQuery.orgId = req.params.orgId;

        $page.isRoleGroup(roleQuery, options, 'tilist', function (groups) {
          callback(null, tilist, groups);
        });
      }
    },
    function (tilists, groups, callback) {
      tilists.forEach(function (tilist) {
        var id = JSON.stringify(tilist._id);
        id = JSON.parse(id);

        var isRole = _.findWhere(groups, {
          "linkTo": "tilist",
          "linkId": id
        });

        if (isRole) {
          tilist.isRoleBased = true;
        } else {
          tilist.isRoleBased = false;
        }
      });

      callback(null, tilists);
    }], function (err, tilists) {
      res.send(tilists);
    });
};

var folderByTiles = function (req, res, next) {
  var tilistId = req.params.tilistId;

  $async.waterfall([
    function (callback) {
      query = { "_id": tilistId };
      options = {};

      _getFolder(query, function (tilist) {
        callback(null, tilist);
      });
    },
    function (tilist, callback) {
      if (tilist && tilist[0] && tilist[0].hasOwnProperty("tiles") && tilist[0].tiles.length > 0) {
        tilist = $general.convertToJsonObject(tilist);
        var tileIds = [];

        _.each(tilist[0].tiles, function (tile) {
          if (tile && tile.hasOwnProperty("_id")) {
            tileIds.push(tile._id)
          }
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
                var tileResult = _.findWhere(tilist[0].tiles, {
                  "_id": tileObj._id
                });

                tileResult.tileData = tileObj;
              }
            });

            callback(null, tilist);
          });
        } else {
          callback(null, tilist);
        }
      } else {
        callback(null, tilist);
      }
    }], function (err, result) {
      res.send(result);
    });
};

var _getFolder = function (tQuery, callback) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tilist, tQuery, options, function (result) {
    callback(result);
  });
};

var updateTilist = function (tQuery, tOptions, dataToUpdate, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.tilist, tQuery, tOptions, dataToUpdate, function (result) {
    cb(result);
  });
};

var _setTilistObj = function (tilist) {
  if (!__util.isNullOrEmpty(tilist.availableStart)) {
    tilist.availableStart = $general.stringToDate(tilist.availableStart);
  }

  if (!__util.isNullOrEmpty(tilist.availableEnd)) {
    tilist.availableEnd = $general.stringToDate(tilist.availableEnd);
  }

  if (!__util.isNullOrEmpty(tilist.dateCreated)) {
    tilist.dateCreated = $general.stringToDate(tilist.dateCreated);
  }

  if (!__util.isNullOrEmpty(tilist.dateUpdated)) {
    tilist.dateUpdated = $general.stringToDate(tilist.dateUpdated);
  }

  _.each(tilist.tiles, function (tile) {
    tile.dateTileCreated = $general.stringToDate(tile.dateTileCreated);
    tile.dateTileUpdated = $general.stringToDate(tile.dateTileUpdated);
  });

  return tilist;
};

var remove = function (req, res, next) {
  query = {};
  options = {};
  var obj = {};
  obj.deleted = false;

  if (!__util.isNullOrEmpty(req.params.tilistId)) {
    query._id = req.params.tilistId;

    $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.tilist, query, options, function (result) {
      obj.deleted = result;
      res.send(obj);
    });
  } else {
    res.send(obj);
  }
};

var _getTilists = function (ids, cb) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tilist, ids, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "remove": remove,
  "updateTilist": updateTilist,
  "folderByTiles": folderByTiles,
  "_getTilists": _getTilists
};
//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var tile = require(path.join(process.cwd(), 'models', 'tile'));
var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = {};
  options = {};
  //options = {"limit":10, "skip" : 50};
  options.sort = [['lastUpdatedOn', 'desc']];
  query.appSettings = {
    $nin: [true]
  };

  if (!__util.isNullOrEmpty(req.params.organizationId)) {
    query.organizationId = {
      $in: [req.params.organizationId]
    };
  }

  if (req.body.hasOwnProperty("form_data") && !__util.isEmptyObject(req.body.form_data)) {
    var orgIds = req.body.form_data;

    query.organizationId = {
      $in: orgIds._ids
    };
  }

  _getTiles(query, function (tiles) {
    res.send(tiles);
  });
};

var _getTiles = function (ids, cb) {
  $async.waterfall([
    function (callback) {
      var tileFields = { blocksData: 0 };

      $tile.getSpecificFields(tileFields, ids, options, function (tiles) {
        callback(null, tiles);
      });
    },
    function (tiles, callback) {
      options = {};

      if (__util.isNullOrEmpty(ids.organizationId)) {
        callback(null, tiles, []);
      } else {
        var roleQuery = {};
        roleQuery.orgId = ids.organizationId;

        $page.isRoleGroup(roleQuery, options, 'tile', function (groups) {
          callback(null, tiles, groups);
        });
      }
    },
    function (tiles, groups, callback) {
      if (tiles.length > 0) {
        _getUserIds(tiles, function (userIds) {
          callback(null, tiles, groups, userIds);
        });
      } else {
        callback(null, tiles, groups, []);
      }
    },
    function (tiles, groups, userIds, callback) {
      if (userIds.length > 0) {
        $user.getList(userIds, function (users) {
          var list = {};
          users = JSON.stringify(users);
          users = JSON.parse(users);

          tiles.forEach(function (tile) {
            var id = JSON.stringify(tile._id);
            id = JSON.parse(id);

            var isRole = _.findWhere(groups, {
              "linkTo": "tile",
              "linkId": id
            });

            var user = _.findWhere(users, {
              "_id": tile.userId
            });

            var updatedUser = _.findWhere(users, {
              "_id": tile.lastUpdatedBy
            });

            if (isRole) {
              tile.isRoleBased = true;
            } else {
              tile.isRoleBased = false;
            }

            if (user) {
              tile.userName = user.name;
            }

            if (updatedUser) {
              tile.lastUpdatedUser = updatedUser.name;
            }
          });

          callback(null, tiles);
        });
      } else {
        callback(null, tiles);
      }
    }], function (err, result) {
      cb(result);
    });
};

var _getUserIds = function (tiles, cb) {
  var userIds = [];
  _.each(tiles, function (tile) {
    userIds.push(tile.userId);

    if (tile.lastUpdatedBy) {
      var userIdExists = userIds.indexOf(tile.lastUpdatedBy);

      if (userIdExists == -1) {
        userIds.push(tile.lastUpdatedBy);
      }
    }
  });

  cb(userIds);
};

var getSpecificFields = function (fields, dataQuery, dataOptions, cb) {
  $db.selectSpecificFields(settingsConf.dbname.tilist_core, settingsConf.collections.tile, fields, dataQuery, dataOptions, function (tiles) {
    cb(tiles);
  });
};

var tileByIds = function (req, res, next) {
  query = { "_id": req.body.tileIds };
  options = {};
  var tileFields = { blocksData: 0 };

  $tile.getSpecificFields(tileFields, query, options, function (tiles) {
    callback(null, tiles);
  });
};

var update = function (req, res, next) {
  query = {};
  options = {};
  var tiles = {};
  query._id = req.params.tileId;

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    tiles = req.body.form_data;
  }

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    tiles = req.body.form_data;
    tiles = _setTileObj(tiles);
  }

  $tile.tileUpdate(query, options, tiles, function (result) {
    tiles = {};
    tiles._id = result;

    res.send(tiles);
  });
};

var tileUpdate = function (uQuery, uOptions, dataObj, cb) {
  if (!__util.isNullOrEmpty(dataObj)) {
    dataObj = _setTileObj(dataObj);
  }

  $db.update(tileConf.dbname, tileConf.auth, tileConf.collections.tile, uQuery, uOptions, dataObj, function (result) {
    cb(result);
  });
};

var _setTileObj = function (tiles) {
  if (!__util.isNullOrEmpty(tiles.dateCreated)) {
    tiles.dateCreated = $general.stringToDate(tiles.dateCreated);
  }

  if (!__util.isNullOrEmpty(tiles.lastUpdatedOn)) {
    tiles.lastUpdatedOn = $general.stringToDate(tiles.lastUpdatedOn);
  }

  return tiles;
};


module.exports = {
  "init": init,
  "list": list,
  "_getTiles": _getTiles,
  "tileByIds": tileByIds,
  "getSpecificFields": getSpecificFields,
  "update": update,
  "tileUpdate": tileUpdate,
};
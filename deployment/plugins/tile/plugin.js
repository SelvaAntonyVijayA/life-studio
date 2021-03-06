//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var tile = require(path.join(process.cwd(), 'models', 'tile'));
var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;
  var blocks = obj && obj.blocks && obj.blocks.length > 0 ? obj.blocks : [];
  var tokenObj = $authtoken.get(req.cookies.token);

  if (__util.isNullOrEmpty(obj._id)) {
    obj["userId"] = tokenObj.uid;
    obj["lastUpdatedBy"] = tokenObj.uid;

    saveTile(obj, function (result) {
      var resObj = {};
      resObj["_id"] = result;

      if (result) {
        var tileId = result.toString();
        updateTileBlocksTileId(tileId, blocks);
        updateTileWithBlocksData(tileId, blocks);
      }

      res.send(resObj);
    });
  } else {
    options = {};
    query = {};
    query._id = obj._id;
    delete obj["_id"];

    var newBlocks = obj && !__util.isEmptyObject(obj) && obj.hasOwnProperty("newBlocks") && obj.newBlocks.length > 0 ? obj.newBlocks : [];

    obj["lastUpdatedBy"] = tokenObj.uid;

    if (obj.hasOwnProperty("newBlocks")) {
      delete obj["newBlocks"];
    }

    $tile.tileUpdate(query, options, obj, function (result) {
      var resObj = {};
      resObj["_id"] = query._id;

      if (query._id && !__util.isNullOrEmpty(query._id)) {
        var tileId = query._id.toString();
        updateTileBlocksTileId(tileId, blocks);
        updateTileWithBlocksData(tileId, blocks);

        if (newBlocks.length > 0) {
          //$tilestatus.updateNewBlockStatus(newBlocks, query._id);
        }
      }

      res.send(resObj);
    });
  }
};

var list = function (req, res, next) {
  query = {};
  options = {};
  //options = {"limit":10, "skip" : 50};
  options.sort = [['lastUpdatedOn', 'desc']];
  query.appSettings = {
    $nin: [true]
  };

  if (!__util.isNullOrEmpty(req.query.tileId)) {
    query["_id"] = req.query.tileId;
  }

  if (!__util.isNullOrEmpty(req.params.organizationId)) {
    query["organizationId"] = {
      $in: [req.params.organizationId]
    };
  }

  if (req.body.hasOwnProperty("form_data") && !__util.isEmptyObject(req.body.form_data)) {
    var orgIds = req.body.form_data;

    query["organizationId"] = {
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

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.tile, uQuery, uOptions, dataObj, function (result) {
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

var saveTile = function (obj, cb) {
  if (!__util.isNullOrEmpty(obj)) {
    obj = _setTileObj(obj);
  }

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.tile, obj, function (result) {
    cb(result);
  });
};

var updateTileBlocksTileId = function (tileId, blocks) {
  if (tileId && !__util.isNullOrEmpty(tileId) && blocks.length > 0) {
    _.each(blocks, function (blckId) {
      var blckQuery = { "_id": blckId };
      options = {};
      var updateData = { "tileId": tileId };

      $tileblock.updateBlock(blckQuery, options, updateData, function (updateRes) {

      });
    });
  }
};

var updateTileWithBlocksData = function (tileId, blockIds) {
  if (tileId && !__util.isNullOrEmpty(tileId) && blockIds && blockIds.length > 0) {
    $async.waterfall([
      function (cb) {
        var bquery = { _id: blockIds };

        $tileblock.block(bquery, {}, function (blocks) {
          cb(null, blocks);
        });
      }], function (error, blocks) {
        if (blocks && blocks.length > 0) {
          query = { "_id": tileId.toString() };
          options = {};

          var sorted = [];

          blocks = $general.convertToJsonObject(blocks);

          _.each(blockIds, function (blkId, index) {
            var obj = _.findWhere(blocks, { "_id": blkId });

            if (!__util.isEmptyObject(obj) && obj.hasOwnProperty("_id") && !__util.isNullOrEmpty(obj._id)) {
              obj._id = $db.objectId(obj._id);

              sorted.push(obj);
            }
          });

          var obj = { "blocksData": sorted };

          $tile.tileUpdate(query, options, obj, function (result) {

          });
        }
      });
  }
};

var remove = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      options = {};
      query = {};
      query._id = req.params.tileId;

      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tile, query, options, function (tiles) {
        callback(null, tiles);
      });
    },
    function (tiles, callback) {
      if (tiles.length > 0) {
        if (tiles[0].blocks && tiles[0].blocks.length > 0) {
          var blockQuery = {};
          options = {};
          blockQuery._id = tiles[0].blocks;

          $tileblock._remove(blockQuery, options, function (result) {
            callback(null, result);
          });
        } else {
          callback(null, {});
        }
      } else {
        callback(null, {});
      }

    }], function (err, result) {
      options = {};
      query = {};
      query._id = req.params.tileId;

      _removeTile(query, options, function (result) {
        var obj = {};
        obj.deleted = result;
        res.send(obj);
      });
    });
};

var _removeTile = function (queryRemoveTile, options, cb) {
  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.tile, queryRemoveTile, options, function (result) {
    if (cb) {
      cb(result);
    }
  });
};

var _getSquares = function (ids, tileType, blockType, cb) {
  options = {};

  $async.waterfall([
    function (callback) {
      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tile, ids, options, function (result) {
        callback(null, result);
      });
    },
    function (result, callback) {
      if (result.length > 0) {
        _getBlockIds(result, tileType, function (blockIds) {
          callback(null, blockIds);
        });
      } else {
        callback(null, []);
      }
    },
    function (blockIds, callback) {
      if (blockIds.length > 0) {
        $tileblock._getBlocks(blockIds, function (blocks) {
          var getBlock = _.where(blocks, {
            type: blockType
          });

          callback(null, getBlock);
        });
      } else {
        callback(null, []);
      }

    }], function (err, result) {
      cb(result);
    });
};

var _getBlockIds = function (tiles, tileType, cb) {
  var blockIds = [];

  _.find(tiles, function (tile, index) {
    if (tile.type.toLowerCase() == tileType) {
      var blocks = tile.blocks ? tile.blocks : [];

      if (blocks.length > 0) {
        blockIds = blockIds.concat(blocks);
      }
    }
  });

  cb(blockIds);
};

var blockByQuery = function (req, res, next) {
  $async.waterfall([
    function (callback) {

      if (__util.isNullOrEmpty(req.params.all)) {
        var tquery = {};
        var tokenObj = $authtoken.get(req.cookies.token);

        tquery["organizationId"] = req.params.organizationId;
        tquery["userId"] = tokenObj.uid;

        _getModeratorTilesMapping(tquery, {}, function (mtiles) {
          if (mtiles.length > 0 && mtiles[0].moderatorTiles && mtiles[0].moderatorTiles.length > 0) {
            callback(null, mtiles[0].moderatorTiles);

          } else {
            callback(null, []);
          }

        });

      } else {
        callback(null, []);
      }

    },
    function (tileIds, callback) {
      var tileFields = { _id: 1, art: 1, title: 1, userId: 1, dateCreated: 1, lastUpdatedOn: 1, category: 1, categoryName: 1, lastUpdatedBy: 1, blocksData: 1 };
      var query = {};

      if (!__util.isNullOrEmpty(req.params.all) || !__util.isEmptyObject(tileIds)) {

        if (!__util.isEmptyObject(tileIds)) {
          query._id = tileIds;
        }

        if (!__util.isNullOrEmpty(req.params.organizationId)) {
          query.organizationId = {
            $in: [req.params.organizationId]
          };
        }

        if (!__util.isNullOrEmpty(req.params.type)) {
          query['blocksData.type'] = req.params.type;
          query.$or = [{ 'blocksData.data.moderated': "true" }, { 'blocksData.data.videoModerated': "true" }];
        }

        var options = {};
        options.sort = [['_id', 'desc']];

        $tile.getSpecificFields(tileFields, query, options, function (tiles) {
          callback(null, tiles);
        });

      } else {
        callback(null, []);
      }

    },
    function (tiles, callback) {
      if (tiles.length > 0) {

        _getUserIds(tiles, function (userIds) {
          callback(null, tiles, userIds);
        });

      } else {
        callback(null, tiles, []);
      }

    },
    function (tiles, userIds, callback) {
      if (userIds.length > 0) {

        $user.getList(userIds, function (users) {
          var list = {};
          users = JSON.stringify(users);
          users = JSON.parse(users);

          tiles.forEach(function (tile) {
            var id = JSON.stringify(tile._id);
            id = JSON.parse(id);

            var user = _.findWhere(users, {
              "_id": tile.userId
            });

            var updatedUser = _.findWhere(users, {
              "_id": tile.lastUpdatedBy
            });

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
      res.send(result);
    });
};

var _getModeratorTilesMapping = function (tquery, toptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.moderatortilemapping, tquery, toptions, function (result) {

    if (cb) {
      cb(result);
    }
  });
};

module.exports = {
  "init": init,
  "save": save,
  "saveTile": saveTile,
  "list": list,
  "remove": remove,
  "_getTiles": _getTiles,
  "tileByIds": tileByIds,
  "getSpecificFields": getSpecificFields,
  "update": update,
  "tileUpdate": tileUpdate,
  "updateTileBlocksTileId": updateTileBlocksTileId,
  "updateTileWithBlocksData": updateTileWithBlocksData,
  "_getSquares": _getSquares,
  "blockByQuery": blockByQuery
};
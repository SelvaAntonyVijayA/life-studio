var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;
  var tokenObj = $authtoken.get(req.cookies.token);

  if (__util.isNullOrEmpty(obj._id)) {
    obj["createdBy"] = tokenObj.uid;

    _saveEngine(obj, function (result) {
      _updateRuleInTile(obj.tileId, result.toString(), obj.name);
      $tilestatus.saveHsrByOrg(req.cookies.oid);

      res.send({ "_id": result });
    });
  } else {
    options = {};
    var updateQuery = {};
    updateQuery._id = obj._id;
    delete obj["_id"];

    $healthstatusrules._update(updateQuery, options, obj, function (result) {
      _updateRuleInTile(obj.tileId, updateQuery._id, obj.name);
      $tilestatus.saveHsrByOrg(req.cookies.oid);

      res.send({ "_id": updateQuery["_id"] });
    });
  }
};

var _update = function (where, condition, data, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.hsrengine, where, condition, data, function (result) {
    cb(result);
  });
};

var _saveEngine = function (obj, cb) {
  if (!__util.isNullOrEmpty(obj)) {
    obj = _setEngineObj(obj);
  }

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.hsrengine, obj, function (result) {
    cb(result);
  });
};

var list = function (req, res, next) {
  query = { "orgId": req.params.orgId };
  options = {};

  console.dir(query);

  _get(query, options, function (result) {
    var hsrResult = result.length > 0 ? result : [];

    res.send(hsrResult);
  });
};

var _get = function (hQuery, hOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.hsrengine, hQuery, hOptions, function (result) {
    cb(result);
  });
};

var getall = function (req, res, next) {
  $async.parallel({
    tiles: function (cb) {
      $async.waterfall([
        function (callback) {
          query = {};
          query.organizationId = req.params.orgId;

          $tile._getTiles(query, function (tiles) {
            callback(null, tiles);
          });
        },
        function (tiles, callback) {
          if (tiles.length > 0) {
            _getBlockIds(tiles, 'content', function (blockIds) {
              callback(null, tiles, blockIds);
            });

          } else {
            callback(null, tiles, []);
          }
        },
        function (tiles, blockIds, callback) {
          if (blockIds.length > 0) {
            $tileblock._getBlocks(blockIds, function (blocks) {
              var getBlock = _.filter(blocks, function (block) {
                if (block) {
                  return block.type === 'survey' || block.type === 'painlevel' || block.type === 'questionnaire';
                }
              });

              getBlock = $general.convertToJsonObject(getBlock);

              callback(null, tiles, getBlock);
            });

          } else {
            callback(null, tiles, []);
          }
        }], function (err, tiles, blocks) {
          var data = {
            data: tiles,
            blocks: blocks
          };

          cb(null, data);
        });

    },
    apptiles: function (cb) {
      $page.getAllTileIdsAssignedToApp(req.params.orgId, function (pages) {
        cb(null, pages);
      });
    }
  }, function (err, result) {
    res.send(result);
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

var _updateRuleInTile = function (tileIds, ruleId, ruleName) {
  var ruleObj = {
    "ruleId": ruleId.toString(),
    "ruleName": ruleName
  };

  $async.waterfall([
    function (callback) {
      var tileQuery = {
        "_id": tileIds
      };

      $tile._getTiles(tileQuery, function (tiles) {
        tiles = $general.convertToJsonObject(tiles);

        callback(null, tiles);
      });
    }], function (err, tiles) {
      tiles.forEach(function (tileObj) {
        var tileData = {};

        if (__util.isNullOrEmpty(tileObj.hsrRuleEngine)) {
          tileData = {
            "hsrRuleEngine": [ruleObj]
          };
        } else {
          var ruleExists = _.findWhere(tileObj.hsrRuleEngine, {
            ruleId: ruleObj.ruleId
          });

          if (!ruleExists) {
            tileObj.hsrRuleEngine.push(ruleObj);

            tileData = {
              "hsrRuleEngine": tileObj.hsrRuleEngine
            };
          }
        }

        $tile.tileUpdate({
          _id: tileObj._id
        }, tileData, tileData, function (result) {
        });
      });
    });
};


module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "_get": _get,
  "getall": getall
};


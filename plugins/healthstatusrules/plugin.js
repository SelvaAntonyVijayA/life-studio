var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
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

module.exports = {
  "init": init,
  "list": list,
  "_get": _get,
  "getall": getall
};


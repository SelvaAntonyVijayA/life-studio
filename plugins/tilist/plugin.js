var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
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
          var tileFields = { "_id": 1, "title": 1, "art": 1 };

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

module.exports = {
  "init": init,
  "list": list,
  "folderByTiles": folderByTiles
};
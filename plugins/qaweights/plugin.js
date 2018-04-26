var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var getAppTilesSquares = function (req, res, next) {
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
    var resultMain = {
      "tiles": result.tiles,
      "apptiles": result.apptiles,
    };

    res.send(resultMain);
  });
};

module.exports = {
  "init": init,
  "getAppTilesSquares": getAppTilesSquares
};
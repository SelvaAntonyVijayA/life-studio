var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
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

module.exports = {
  "init": init,
  "getall": getall,
  "list": list,
  "get": get
};
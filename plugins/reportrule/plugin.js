var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.reportrule, obj, function (result) {
    var resultObj = { "_id": result };
    res.send(resultObj);
  });
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

var deleteRule = function (req, res, next) {
  query = {};
  options = {};
  query["_id"] = req.params.orgId;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.reportrule, query, options, function (result) {
    var deleteResult = { "deleted": result };

    res.send(deleteResult);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "getall": getall,
  "list": list,
  "get": get,
  "deleteRule": deleteRule
};
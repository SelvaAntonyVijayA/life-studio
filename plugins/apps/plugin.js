var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query.organizationId = req.params.orgId;
  } else if (!__util.isNullOrEmpty(req.body.form_data)) {
    query = req.body.form_data;
  }
  
  if (__util.isEmptyObject(query)) {
    res.send({});
  } else {
    _getApps(query, options, function (result) {
      if (!__util.isNullOrEmpty(req.params.isAdmin) && result && result.length > 0) {
        result = _processAutoApprove(result);
      }

      res.send(result);
    });
  }
};

var _processAutoApprove = function (appsToProcess) {
  _.each(appsToProcess, function (app) {
    if (!__util.isNullOrEmpty(app["autoApprove"]) && app["autoApprove"] == true) {
      app["authenticated"] = "4";
    }
  });

  return appsToProcess;
};

var _getApps = function (aQuery, aOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.apps, aQuery, aOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "list": list
}
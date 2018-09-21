var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = {};

  if (req.body.hasOwnProperty("organizationId") && !__util.isNullOrEmpty(req.body.organizationId)) {
    query.organizationId = context.data.organizationId;

  } else if (!__util.isNullOrEmpty(req.params.orgId)) {
    query.organizationId = req.params.orgId;

  } else {
    res.status(404).send('Not found');
  }

  options = {};
  options.sort = [['dateUpdated', 'desc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.reportrule, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "list": list
};
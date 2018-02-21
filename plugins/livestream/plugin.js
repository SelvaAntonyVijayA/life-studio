var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query.organizationId = req.params.orgId;
  }

  if (!__util.isNullOrEmpty(req.params.appId)) {
    query["createdApp.id"] = req.params.appId;
  }

  if (!__util.isNullOrEmpty(req.params.locationId)) {
    query["locationId"] = req.params.locationId;
  }

  if (req.body.hasOwnProperty('form_data')) {
    query = req.body.form_data;
  }

  if ((!req.body.hasOwnProperty("form_data") && !__util.isEmptyObject(req.body)) || query.hasOwnProperty('assignedUserIds')) {
    if (!query.hasOwnProperty('assignedUserIds')) {
      query = req.body;
    }

    var tokenObj = $authtoken.get(req.cookies.token);

    query.assignedUserIds = {
      $exists: true,
      $in: [tokenObj.uid]
    };
  }

  if (!__util.isNullOrEmpty(query.start)) {
    delete query.start;
  }

  if (!__util.isNullOrEmpty(query.limit)) {
    delete query.limit;
  }

  options.sort = [['_id', 'desc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.livestream, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "list": list
};
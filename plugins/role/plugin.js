//var path = require("path");
var settingsConf;
var options = {};
var query = {};

//var role = require(path.join(process.cwd(), 'models', 'role'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    query = req.body.form_data;
  }

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query = {
      $or: [{
        organizationId: {
          $exists: false
        }
      }, {
        organizationId: req.params.orgId
      }]
    };
  }

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.role, query, options, function (result) {
    res.send(result);
  });
};

var _get = function (query, options, cb) {
  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.role, query, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "_get": _get
};
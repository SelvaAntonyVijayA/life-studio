//var path = require("path");
var settingsConf;
var options = {};
var query = {};

//var role = require(path.join(process.cwd(), 'models', 'role'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var _get = function (query, options, cb) {
  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.role, query, options, function (result) {
    cb(result);
  });
};

module.exports = { 
  "init": init, 
  "_get": _get 
};
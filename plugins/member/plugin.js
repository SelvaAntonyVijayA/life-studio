var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var _getMember = function (query, options, cb) {
  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.members, query, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "_getMember": _getMember
};
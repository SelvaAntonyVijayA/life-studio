var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var _getNotificationList = function (nQuery, cb) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.notification, nQuery, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "_getNotificationList": _getNotificationList
};
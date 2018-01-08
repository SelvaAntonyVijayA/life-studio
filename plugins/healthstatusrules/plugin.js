var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var _get = function (hQuery, hOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.hsrengine, hQuery, hOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "_get": _get
};


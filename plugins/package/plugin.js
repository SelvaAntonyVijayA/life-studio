var settingsConf;
var options = {};
var query = {};

/* Intialize the plugin for ili settings */
var init = function (app) {
  settingsConf = app.get('settings');
};

var getPackage = function (pQuery, pOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.package, pQuery, pOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "getPackage": getPackage
};

var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var _get = function (sQuery, sOptions, cb) {
  if (__util.isEmptyObject(sQuery.engineId)) {
    sQuery.engineId = "";
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, sQuery, sOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "_get": _get
};
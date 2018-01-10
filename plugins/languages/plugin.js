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

  getLanguages(query, options, function (result) {
    res.send(result);
  });
};

var getLanguages = function (lQuery, lOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.languages, lQuery, lOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "getLanguages": getLanguages
};
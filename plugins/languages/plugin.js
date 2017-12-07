var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  console.dir()
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];
  
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.languages, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "list": list
};
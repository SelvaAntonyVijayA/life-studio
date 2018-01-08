var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var getSpecificFields = function (fields, dataQuery, dataOptions, cb) {
  $db.selectSpecificFields(settingsConf.dbname.tilist_core, settingsConf.collections.memberblockdata, fields, dataQuery, dataOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "getSpecificFields": getSpecificFields
};
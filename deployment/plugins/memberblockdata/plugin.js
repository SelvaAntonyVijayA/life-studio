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

var _blockData = function (dataQuery, dataOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.memberblockdata, dataQuery, dataOptions, function (result) {
    cb(result);
  });
};

var _saveMemberBlockData = function (obj, cb) {
  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.memberblockdata, obj, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "getSpecificFields": getSpecificFields,
  "_blockData": _blockData,
  "_saveMemberBlockData": _saveMemberBlockData
};
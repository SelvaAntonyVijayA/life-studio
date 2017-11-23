//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var query = {};
var options = {};

//var organization = require(path.join(process.cwd(), 'models', 'organization'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var getList = function (query, cb) {
  options = {};
  options.sort = [['name', 'asc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.organization, query, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "getList": getList
};


//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var tileCategory = require(path.join(process.cwd(), 'models', 'tilecategory'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var get = function (req, res, next) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];
  query.organizationId = !__util.isNullOrEmpty(req.params.orgId) ? req.params.orgId : "-1";

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tileCategory, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "get": get
};


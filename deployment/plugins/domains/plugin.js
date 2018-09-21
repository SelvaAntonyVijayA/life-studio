//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var query = {};
var options = {};

//var domains = require(path.join(process.cwd(), 'models', 'domains'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var get = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.body.domainName)) {
    query = { "name": req.body.domainName };
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.domains, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "get": get
};
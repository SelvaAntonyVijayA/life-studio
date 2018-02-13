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

var getOrgPackage = function (req, res, next) {
  query = {};
  options = {};

  query["_id"] = req.params.orgId;

  getOrgs(query, options, function (orgResult) {
    if (orgResult && orgResult.length > 0 && !__util.isNullOrEmpty(orgResult[0].packageId)) {
      query["_id"] = orgResult[0].packageId;

      $package.getPackage(query, options, function (result) {
        res.send(result);
      });
    } else {
      res.send([]);
    }
  });
};

var getOrgs = function (oQuery, oOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.organization, oQuery, oOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "getList": getList,
  "getOrgPackage": getOrgPackage
};


//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var tileCategory = require(path.join(process.cwd(), 'models', 'tilecategory'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var category = req.body.hasOwnProperty("form_data") ? req.body.form_data : {};

  $tilecategory._saveTileCategory(category, function (result) {
    category = {};
    category._id = result;

    res.send(category);
  });
};

var get = function (req, res, next) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];
  query.organizationId = !__util.isNullOrEmpty(req.params.orgId) ? req.params.orgId : "-1";

  getCategories(query, options, function(result){
    res.send(result);
  });
};

var getCategories = function(cQuery, cOptions, cb){
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tileCategory, cQuery, cOptions, function (result) {
    cb(result);
  });
};

var _saveTileCategory = function (tileCatData, cb) {
  if (!__util.isEmptyObject(tileCatData)) {
    $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.tileCategory, tileCatData, function (result) {
      cb(result);
    });
  } else {
    cb(result);
  }
};

module.exports = {
  "init": init,
  "save": save,
  "get": get,
  "_saveTileCategory": _saveTileCategory,
  "getCategories": getCategories
};


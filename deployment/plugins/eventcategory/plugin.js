//var path = require("path");
//var mongoose = require('mongoose');
//Schema = mongoose.Schema;
var settingsConf;
var options = {};
var query = {};

//var eventCategory = require(path.join(process.cwd(), 'models', 'eventcategory'));
var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  query = {};
  options = {};

  var category = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.eventCategory, category, function (result) {
    var resultObj = {};
    resultObj._id = result;
    res.send(resultObj);
  });
};

var list = function (req, res, next) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];
  query.organizationId = !__util.isNullOrEmpty(req.params.orgId) ? req.params.orgId : "-1";

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.eventCategory, query, options, function (result) {
    res.send(result);
  });
};

var saveProcedureCategory = function (req, res, next) {
  var category = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.procedureCategory, category, function (result) {
    var resultObj = { "_id": result };
    res.send(resultObj);
  });
};

var listProcedureCategory = function (req, res, next) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];
  query.organizationId = req.params.orgId;

  if (!__util.isNullOrEmpty(req.query.dtype)) {
    if (req.query.dtype == "procedure") {
      query.$or = [{ type: "procedure" }, { type: { $exists: false } }];
    } else {
      query.type = req.query.dtype;
    }
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.procedureCategory, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "saveProcedureCategory": saveProcedureCategory,
  "listProcedureCategory": listProcedureCategory
};


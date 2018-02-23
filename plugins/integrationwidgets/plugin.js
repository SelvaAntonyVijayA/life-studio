var settingsConf;

var init = function (app) {
  settingsConf = app.get("integration");
};

var save = function (req, res, next) {
  let obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.integrationwidgets, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  let query = {};

  if (!__util.isEmptyObject(req.body.form_data)) {
    query = req.body.form_data;
  }

  let options = {};
  options.sort = [['name', 'asc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.integrationwidgets, query, options, function (result) {

    res.send(result);
  });
};

var remove = function (req, res, next) {
  let query = {};
  query._id = req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.integrationwidgets, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var getIntegrationWidgets = function (query, cb) {
  let options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.integrationwidgets, query, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "remove": remove,
  "getIntegrationWidgets": getIntegrationWidgets
};
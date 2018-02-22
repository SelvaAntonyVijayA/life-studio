const settingsConf;

var init = function () {
  settingsConf = __conf.get("integration");
};

var save = function (req, res, next) {
  let obj = JSON.parse(req.body.form_data);

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.integrationtype, obj, function (result) {
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

  $integrationtype.getIntegrationTypes(query, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  let query = {};
  query._id = req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.integrationtype, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var getIntegrationTypes = function (query, cb) {
  let options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.integrationtype, query, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "remove": remove,
  "list": list,
  "getIntegrationTypes": getIntegrationTypes
};
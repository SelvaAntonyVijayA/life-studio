'use strict';
var settingsConf;

var init = function () {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.organizationtype, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  let query = {};
  let options = {};

  if (!__util.isEmptyObject(req.body.form_data)) {
    query = req.body.form_data;
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.organizationtype, query, options, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  let query = {};
  let options = {};
  query._id = req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.organizationtype, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "remove": remove
};

var settingsConf;

/* Intialize the plugin for ili settings */
var init = function (app) {
  settingsConf = app.get('settings');
};

var getPackage = function (pQuery, pOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.package, pQuery, pOptions, function (result) {
    cb(result);
  });
};

var save = function (req, res, next) {
  let obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, packageconf.collections.package, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  let query = {};
  let options = {};
  options.sort = [['name', 'asc']];

  if (!__util.isEmptyObject(req.body.form_data)) {
    query = req.body.form_data;
  }

  console.log(query)
  console.log(options)

  getPackage(query, options, function (result) {
    res.send(result);
  });
};

var update = function (req, res, next) {
  let obj = {};
  let query = {};
  let options = {
    upsert: true
  };

  query._id = req.params.id;
  obj = req.body.form_data;

  _update(query, options, obj, function (result) {
    res.send(query);
  });
};

var _update = function (where, condition, data, cb) {
  $db.update(settingsConf.dbname.tilist_core, packageconf.collections.package, where, condition, data, function (result) {
    cb(result);
  });
};

var tccsave = function (req, res, next) {
  let tcc = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, packageconf.collections.totaltileclicks, tcc, function (result) {
    let obj = {};
    obj._id = result;

    cb(obj);
  });
};

var tcclist = function (req, res, next) {
  let query = {};

  if (!__util.isEmptyObject(req.body.form_data)) {
    query = req.body.form_data;
  }
  
  $db.select(settingsConf.dbname.tilist_core, packageconf.collections.totaltileclicks, query, options, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  let query = {};
  let options = {};
  query._id = req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, packageconf.collections.package, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "tccsave": tccsave,
  "tcclist": tcclist,
  "update": update,
  "_update": _update,
  "remove": remove,
  "getPackage": getPackage
};

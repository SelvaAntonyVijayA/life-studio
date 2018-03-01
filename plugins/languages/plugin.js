var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  let query = {};
  let options = {};
  options.sort = [['name', 'asc']];

  getLanguages(query, options, function (result) {
    res.send(result);
  });
};

var save = function (req, res, next) {
  let obj = req.body.form_data;
  var tokenObj = $authtoken.get(req.cookies.token);
  obj["createdBy"] = tokenObj.uid;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.auth, settingsConf.collections.languages, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var update = function (req, res, next) {
  let query = {};
  let options = {};
  let languageToUpdate = req.body.form_data;
  query._id = req.params.id;

  $db.update(settingsConf.dbname.tilist_core, settingsConf.auth, settingsConf.collections.languages, query, options, languageToUpdate, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  let options = {};
  let query = {};
  query._id = req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.auth, settingsConf.collections.languages, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var getLanguages = function (lQuery, lOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.languages, lQuery, lOptions, function (result) {
    cb(result);
  });
};

var _get = function (lQuery, cb) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.languages, lQuery, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "save": save,
  "remove": remove,
  "getLanguages": getLanguages,
  "_get": _get
};
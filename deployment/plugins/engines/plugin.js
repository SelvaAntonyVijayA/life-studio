var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  let obj = req.body.form_data;
  var tokenObj = $authtoken.get(req.cookies.token);
  obj["createdBy"] = tokenObj.uid;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.engines, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  let query = {};
  let options = {};
  options.sort = [['name', 'asc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.engines, query, options, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "save": save
};
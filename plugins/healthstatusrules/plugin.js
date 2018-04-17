var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  query = { "orgId": req.params.orgId };
  options = {};

  console.dir(query);

  _get(query, options, function (result) {
    var hsrResult = result.length > 0 ? result : [];

    res.send(hsrResult);
  });
};

var _get = function (hQuery, hOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.hsrengine, hQuery, hOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "_get": _get
};


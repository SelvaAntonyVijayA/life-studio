var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  options = {};
  query = {};

  options.sort = [['name', 'asc']];

  if (!__util.isNullOrEmpty(req.params.appId)) {
    query.appId = req.params.appId;
  } else if (!__util.isNullOrEmpty(req.body.form_data)) {
    query = req.body.form_data;
  }

  if (!req.cookies.hasOwnProperty("token") && !req.cookies.hasOwnProperty("oid")) {
    query.status = "yes";
  }

  if (__util.isEmptyObject(query)) {
    res.send({});
  } else {
    $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.location, query, options, function (result) {
      res.send(result);
    });
  }
};

module.exports = {
  "init": init,
  "list": list
};
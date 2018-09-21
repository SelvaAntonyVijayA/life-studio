var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;
  var tokenObj = $authtoken.get(req.cookies.token);

  if (!__util.isNullOrEmpty(obj.dateCreated)) {
    obj.dateCreated = $general.stringToDate(obj.dateCreated);
  }

  if (__util.isNullOrEmpty(obj._id)) {
    obj["createdBy"] = tokenObj.uid;
    obj.dateCreated = $general.getIsoDate();

  } else {
    obj["updatedBy"] = tokenObj.uid;
  }

  obj.dateUpdated = $general.getIsoDate();

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.settings, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  var squery = {};
  var params = req.params;

  squery.organizationId = params.orgId;

  if (!__util.isNullOrEmpty(params.appId)) {
    squery.appId = params.appId;
  }

  if (!__util.isNullOrEmpty(params.locationId)) {
    squery.locationId = params.locationId;
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.settings, squery, {}, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  var params = req.params;
  var rmquery = {
    _id: params.id
  };

  var returnObj = {
    deleted: false
  };

  if (!__util.isNullOrEmpty(rmquery._id)) {
    $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.settings, rmquery, {}, function (result) {
      returnObj.deleted = result;

      res.send(returnObj);
    });

  } else {
    res.send(returnObj);
  }
};

var _get = function (settingQuery, settingOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.settings, settingQuery, settingOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "save": save,
  "_get": _get,
  "remove": remove
};

var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;
  var engineId = obj.engineId;
  var type = obj.type;
  var appId = obj.appId;
  query = {};
  query.appId = obj.appId;
  query.orgId = obj.orgId;
  query.type = obj.type;
  query.engineId = obj.engineId;

  options = {};

  var tokenObj = $authtoken.get(req.cookies.token);

  obj["createdBy"] = tokenObj.uid;

  _get(query, options, function (smrtRes) {
    if (smrtRes.length > 0) {
      query = {};
      query._id = smrtRes[0]._id;
      options = {};

      if (!__util.isNullOrEmpty(obj)) {
        obj = _setEngineObj(obj);
      }

      _update(query, options, obj, function (result) {
        $page.smartUpdate(obj);
        let updateObj = { "_id": smrtRes[0]._id };

        $apps.getAppsByIds({}, function (apps) {
          $notification.processSmartEngine(engineId, type, appId, false);
          res.send(updateObj);
        });
      });

    } else {
      saveEngine(obj, function (result) {
        $page.smartUpdate(obj);
        var saveObj = { "_id": result };

        $apps.getAppsByIds({}, function (apps) {
          $notification.processSmartEngine(engineId, type, appId);
          res.send(saveObj);
        });
      });
    }
  });
};

var _get = function (sQuery, sOptions, cb) {
  if (__util.isEmptyObject(sQuery.engineId)) {
    sQuery.engineId = "";
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, sQuery, sOptions, function (result) {
    cb(result);
  });
};

var _setEngineObj = function (obj) {
  if (!__util.isNullOrEmpty(obj.dateCreated)) {
    obj.dateCreated = $general.stringToDate(obj.dateCreated);
  }

  if (!__util.isNullOrEmpty(obj.dateUpdated)) {
    obj.dateUpdated = $general.stringToDate(obj.dateUpdated);
  }

  return obj;
};

var _update = function (where, condition, data, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, where, condition, data, function (result) {
    cb(result);
  });
};

var saveEngine = function (obj, cb) {
  if (!__util.isNullOrEmpty(obj)) {
    obj = _setEngineObj(obj);
  }

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, obj, function (result) {
    cb(result);
  });
};

var list = function (req, res, next) {
  query = {};

  if (!__util.isNullOrEmpty(req.params.orgId) && !__util.isNullOrEmpty(req.params.appId)) {
    query.orgId = req.params.orgId;
    query.appId = req.params.appId;
  }

  var obj = req.body.form_data;

  if (!__util.isNullOrEmpty(obj.type)) {
    query.type = obj.type;
  }

  if (!__util.isNullOrEmpty(obj.engineId)) {
    query.engineId = obj.engineId;
  }

  options = {};

  if (__util.isEmptyObject(query.engineId)) {
    query.engineId = "";
  }

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, query, options, function (result) {

    var smartRes = result.length > 0 ? result : [];
    res.send(smartRes);
  });
};

var remove = function (req, res, next) {
  var obj = req.body.form_data;
  var engineId = obj.engineId;
  var type = obj.type;
  var appId = obj.appId;
  query = {};
  query.appId = obj.appId;
  query.orgId = obj.orgId;
  query.type = obj.type;
  query.engineId = obj.engineId;
  options = {};

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, query, options, function (result) {
    $page.smartUpdate(obj);
    var deleteObj = { "deleted": result };

    $apps.getAppsByIds({}, function (apps) {
      $notification.processSmartEngine(engineId, type, appId, true);
      res.send(deleteObj);
    });
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "remove": remove,
  "_get": _get,
  "_update": _update,
  "saveEngine": saveEngine
};
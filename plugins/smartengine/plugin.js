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

  _get(query, options, function (result) {
    if (result.length > 0) {
      query = {};
      query._id = result[0]._id;
      options = {};

      if (!__util.isNullOrEmpty(obj)) {
        obj = _setEngineObj(obj);
      }

      _update(query, options, obj, function (result) {
        $page.smartUpdate(obj);
        let updateObj = { "_id": result[0]._id };

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

var saveEngine = function(obj, cb) {
  if (!__util.isNullOrEmpty(obj)) {
    obj = _setEngineObj(obj);
  }

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.smartengine, obj, function(result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "_get": _get,
  "_update": _update,
  "saveEngine": saveEngine
};
var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  let orgType = {};
  let apps = req.body.form_data;
  let orgId = apps.organizationId;

  apps.dateUpdated = $general.getIsoDate();

  if (!__util.isNullOrEmpty(req.params.name)) {
    orgType.name = req.params.name;
    orgType.type = 'AdminRights';
  }

  $async.waterfall([
    function (callback) {
      _getApps({}, {}, function (appsExists) {
        callback(null, appsExists);
      });
    },
    function (appsExists, callback) {
      if (!__util.isNullOrEmpty(req.params.name)) {
        apps.pin = _processAppsPin(appsExists);
      }

      $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.apps, apps, function (result) {
        apps._id = result;

        console.dir(apps)
        callback(null);
      });
    },
    function (callback) {
      $datamigration.appSave(apps, function (result) {
        callback(null, result);
      });
    }
  ], function (error, result) {
    if (!__util.isNullOrEmpty(req.params.name)) {
      $access._getAccess(orgType, function (objAccess) {
        if (objAccess.length > 0) {
          _processAppsByType(objAccess[0], apps, orgId, function (obj) {
            res.send(apps);
          });
        } else {
          res.send(apps);
        }
      });
    } else {
      res.send(apps);
    }
  });
};


var update = function (appId, updateApp, cb) {
  let query = {};
  let options = {};
  query._id = appId;

  if (!__util.isEmptyObject(updateApp)) {
    updateApp.dateUpdated = $general.getIsoDate();
  }

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.apps, query, options, updateApp, function (result) {
    updateApp._id = query._id;
    $datamigration.appSave(updateApp);

    let appUpdated = {};
    appUpdated._id = query._id;
    if (cb) {
      cb(appUpdated);
    }
  });
};

var getAppsByIds = function (query, cb) {
  _getApps(query, {}, function (result) {
    cb(result);
  });
};

var appUpdate = function (req, res, next) {
  let appId = req.params.id;
  let objToUpdate = req.body.form_data;

  update(appId, objToUpdate, function (result) {
    res.send(result);
  });
};

var list = function (req, res, next) {
  let query = {};
  let options = {};
  options.sort = [['name', 'asc']];

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query.organizationId = req.params.orgId;
  } else if (!__util.isNullOrEmpty(req.body.form_data)) {
    query = req.body.form_data;
  }

  if (__util.isEmptyObject(query)) {
    res.send({});
  } else {
    _getApps(query, options, function (result) {
      if (!__util.isNullOrEmpty(req.params.isAdmin) && result && result.length > 0) {
        result = _processAutoApprove(result);
      }

      res.send(result);
    });
  }
};

var _processAutoApprove = function (appsToProcess) {
  _.each(appsToProcess, function (app) {
    if (!__util.isNullOrEmpty(app["autoApprove"]) && app["autoApprove"] == true) {
      app["authenticated"] = "4";
    }
  });

  return appsToProcess;
};

var _getApps = function (aQuery, aOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.apps, aQuery, aOptions, function (result) {
    cb(result);
  });
};

var _processAppsPin = function (appsExists) {
  let appsPin;
  let isValid = false;
  appsExists = $general.convertToJsonObject(appsExists);

  do {
    appsPin = $general.getDynamicPin();

    let appsPinExists = _.findWhere(appsExists, {
      "pin": appsPin
    });

    if (appsPinExists) {
      isValid = true;
    } else {
      isValid = false;
    }
  }
  while (isValid);

  return appsPin;
};

var _processAppsByType = function (type, apps, orgId, cb) {
  let accessType = $general.convertToJsonObject(type);
  let appsObj = $general.convertToJsonObject(apps);

  $async.waterfall([
    function (callback) {
      let recordGet = {
        "assignedAccess._id": accessType._id,
        "isAdmin": true
      };

      $user._getOrgMembers(recordGet, function (orgMembers) {
        callback(null, orgMembers);
      });
    }], function (error, orgMembers) {
      $async.each(orgMembers, function (orgMem, loop) {
        orgMem = $general.convertToJsonObject(orgMem);

        let userApp = {};
        userApp.user_id = orgMem._id;
        userApp.org_id = orgId;
        userApp.app_id = appsObj._id;

        let obj = {};
        obj.apps = userApp;

        $user._saveUserApp(obj, function (result) {
          loop();
        });
      }, function () {
        cb("success");
      });
    });
};

var getAppId = function (req, res, next) {
  var orgName = req.params.orgname;
  var appName = req.params.appname;

  $async.waterfall([
    function (callback) {
      if (__util.isNullOrEmpty(orgName)) {
        callback(null, "");
      } else {
        query = {
          name: orgName
        };

        $organization.getList(query, function (orgResult) {
          if (orgResult.length > 0) {
            callback(null, orgResult[0]._id);
          } else {
            callback(null, "");
          }
        });
      }
    },
    function (organizationId, callback) {
      if (__util.isNullOrEmpty(organizationId)) {
        callback(null, []);
      } else {
        query = {
          organizationId: organizationId.toString()
        };

        _getApps(query, {}, function (appResult) {
          callback(null, appResult);
        });
      }
    }], function (error, result) {
      if (result && result.length > 0) {

        res.rend({
          appId: result[0]._id
        });
      } else {
        res.status(404).send('404 Page Not Found.');
        return;
      }
    });
};

var auth = function (req, res, next) {
  let query = {};
  let options = {};
  query.appId = req.params.appid;

  _get(query.appId, function (appresult) {
    if (appresult && appresult.length > 0) {
      let secureAuth = "3";

      if (!__util.isNullOrEmpty(appresult[0].authenticated)) {
        secureAuth = appresult[0].authenticated;
      }

      let returnResult = {};
      returnResult._id = appresult[0]._id;
      returnResult.name = appresult[0].name;
      returnResult.secure_auth = secureAuth;

      res.rend(returnResult);
    } else {
      if (req) {
        res.status(404).send('404 Page Not Found.');
      }
    }
  });
};

var _get = function (appId, cb) {
  let query = {};
  query._id = appId;
  let options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.apps, query, options, function (result) {
    cb(result);
  });
};

var getAppByPin = function (req, res, next) {
  let query = {};
  query = {
    pin: {
      $exists: true,
      $in: [parseInt(req.params.pin)]
    }
  };

  _getApps(query, {}, function (result) {
    let _id = result.length > 0 ? result[0]._id : "";

    res.rend({
      appId: _id
    });
  });
};

var remove = function (req, res, next) {
  let query = {};
  let options = {};

  if (!__util.isNullOrEmpty(req.params.id)) {
    query._id = req.params.id;
  }

  if (!__util.isEmptyObject(req.body)) {
    query._id = req.body._id;
  }

  console.dir(query)

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.apps, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "save": save,
  "update": update,
  "appUpdate": appUpdate,
  "remove": remove,
  "getAppId": getAppId,
  "getAppByPin": getAppByPin,
  "auth": auth,
  "_get": _get,
  "getAppsByIds": getAppsByIds
}
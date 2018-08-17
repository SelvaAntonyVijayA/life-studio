var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  let options = {};
  let query = {};

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

var save = function (req, res, next) {
  let orgType = {};
  let orgId;
  let location = req.body.form_data;
  let appId = location.appId;
  location.dateUpdated = $general.getIsoDate();

  if (!__util.isNullOrEmpty(req.params.name)) {
    orgType.name = req.params.name;
    orgType.type = 'AdminRights';
    orgId = req.params.orgid;
  }

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.location, location, function (result) {
    location = {};
    location._id = result;

    if (!__util.isNullOrEmpty(req.params.name)) {
      $access._getAccess(orgType, function (objAccess) {
        if (objAccess.length > 0) {
          _processLocationByType(objAccess[0], orgId, appId, location, function (obj) {
            res.send(location);
          });
        } else {
          res.send(location);
        }
      });
    } else {
      res.send(location);
    }
  });
};

var remove = function (req, res, next) {
  let query = {};
  let options = {};
  let locToRemove = {};

  if (!__util.isNullOrEmpty(req.params.id)) {
    query._id = req.params.id;
  }

  if (!__util.isEmptyObject(req.body.form_data)) {
    locToRemove = req.body.form_data;
    query._id = locToRemove._id;
  }

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.location, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    if (locToRemove.preferredLocs.length > 0) {
      _.each(locToRemove.preferredLocs, function (locId, index) {
        $member.removePl(locId);
      });
    }

    res.send(obj);
  });
};

var update = function (req, res, next) {
  let obj = {};
  let query = {};
  let options = {};
  query._id = req.params.id;
  obj = req.body.form_data;

  if (!__util.isEmptyObject(obj)) {
    obj.dateUpdated = $general.getIsoDate();
  }

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.location, query, options, obj, function (result) {

    res.send(query);
  });
};

var getList = function (query, cb) {
  let options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.location, query, options, function (result) {
    cb(result);
  });
};

var locationByUserId = function (req, res, next) {
  let isOrgAdmin;

  $async.waterfall([
    function (callback) {
      let query = {};
      let tokenObj = $authtoken.get(req.cookies.token);

      query.user_id = tokenObj.uid;

      isOrgAdmin = checkOrgAdmin(req, res, next);

      if (!__util.isNullOrEmpty(req.params.orgId)) {
        query.org_id = req.params.orgId;
      }

      if (!__util.isNullOrEmpty(req.params.appId)) {
        query.app_id = req.params.appId;
      }

      if (!isOrgAdmin) {
        $user.getUserlocation(query, {}, function (result) {
          let locations = [];
          _.each(result, function (obj) {
            locations.push(obj.location_id);
          });

          callback(null, locations);
        });
      } else {
        callback(null, []);
      }
    },
    function (assignedLocations, callback) {
      if (assignedLocations.length == 0 && !isOrgAdmin) {
        callback(null, []);
      } else {
        let locationQuery = {
          appId: req.params.appId
        };

        if (!isOrgAdmin) {
          locationQuery["_id"] = assignedLocations;
        }

        let options = {};
        options.sort = [['name', 'asc']];

        $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.location, locationQuery, options, function (result) {
          callback(null, result);
        });
      }
    }], function (error, result) {
      res.send(result);
    });
};

var checkOrgAdmin = function (req, res, next) {
  let result = false;
  var tokenObj = $authtoken.get(req.cookies.token);

  if (tokenObj && tokenObj.user && !__util.isEmptyObject(tokenObj.user.role) && !__util.isNullOrEmpty(tokenObj.user.role.name)) {
    var roleName = tokenObj.user.role.name.replace(/\s+/g, '');

    if (roleName.toLowerCase() == "orgadmin") {
      result = true;
    }
  }

  return result;
};

var _processLocationByType = function (type, orgId, appId, location, cb) {
  let accessType = $general.convertToJsonObject(type);
  let locObj = JSON.stringify(location);
  locObj = JSON.parse(locObj);

  let count = 0;
  let recordGet = {
    "assignedAccess._id": accessType._id,
    "isAdmin": true
  };

  $user._getOrgMembers(recordGet, function (orgMembers) {
    _.each(orgMembers, function (orgMem, index) {
      orgMem = $general.convertToJsonObject(orgMem);

      let userLoc = {};
      userLoc.user_id = orgMem._id;
      userLoc.org_id = orgId;
      userLoc.app_id = appId;
      userLoc.location_id = locObj._id;

      $user._saveUserLoc(userLoc, function (result) {
        count++;

        if (count == orgMembers.length) {
          cb("success");
        }
      });
    });

    if (orgMembers.length == 0) {
      cb("success");
    }
  });
};

module.exports = {
  "init": init,
  "list": list,
  "save": save,
  "update": update,
  "remove": remove,
  "getList": getList,
  "locationByUserId": locationByUserId
};

//var path = require("path");

//var user = require(path.join(process.cwd(), 'models', 'user'));
var settingsConf;

var init = function (app) {
  console.log("ILI Intialized");
  settingsConf = app.get('settings');
};

var getLogin = function (req, res, next) {
  res.render('index.html');
};

var save = function (req, res, next) {
  query = {};
  user = req.body.form_data;
  user.password = $general.encrypt(user.password);
  var tokenObj = $authtoken.get(req.cookies.token);

  if (user && !__util.isNullOrEmpty(user.email)) {
    query["email"] = user.email;
  }

  if (user && !__util.isEmptyObject(user.organizationId)) {
    query["organizationId"] = {
      "$in": [user.organizationId[0]]
    };
  }

  if (__util.isNullOrEmpty(user._id)) {
    _getOrgMembers(query, function (orgMembers) {
      if (orgMembers.length == 0) {
        user["createdby"] = tokenObj.uid;
        var userPin = _processUserPin(orgMembers);
        user.pin = userPin;

        $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, user, function (result) {
          user = {};
          user._id = result;
          user.pin = userPin;

          res.send(user);
        });

      } else {
        res.send({
          "message": "Already Exists"
        });
      }
    });
  } else {
    options = {};
    query = {};
    query._id = user._id;
    delete user["_id"];

    $db.update(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, query, options, user, function (result) {
      user = {};
      user._id = query._id;
      res.send(user);
    });
  }
};


/*var login = function (req, res, next) {
  var obj = req.body.form_data;

  query = {};
  query.email = obj.email.toLowerCase();
  query.password = $general.encrypt(obj.password);

  user.find(query, {}, { lean: true }, function (err, user) {
    var mainResult = { "userfound": false };

    if (user && user.length > 0) {
      mainResult.userfound = true;
      var cookie = req.cookies.cookieName;

      try {
        $async.waterfall([
          function (callback) {
            if (user && user.length > 0) {
              $async.parallel({
                organizations: function (cb) {
                  $organization.getList({
                    _id: { $in: user[0].organizationId }
                  }, {}, function (result) {
                    cb(null, result);
                  });
                },
                role: function (cb) {
                  $role._get({
                    _id: { $in: $general.convertToObjectId(user[0].role_id) }
                  }, {}, function (result) {
                    cb(null, result);
                  });
                }
              }, function (err, result) {
                callback(null, user, result);
              });
            } else {
              callback(null, []);
            }
          }], function (err, userResult, result) {
            var userObj = {};

            userObj.name = userResult[0].name;
            userObj.email = userResult[0].email;
            userObj.isAdmin = userResult[0].isAdmin;
            userObj.pin = userResult[0].pin;
            userObj.roleId = !__util.isNullOrEmpty(userResult[0].role_id) ? userResult[0].role_id : "";
            userObj.role = result.role[0];

            var tokenJSON = {
              uid: userResult[0]._id,
              user: userObj
            };

            var token = $authtoken.generate(tokenJSON);
            res.cookie('token', token);
            res.send(mainResult);
          });
      } catch (e) {
        res.send(mainResult);
      }
    } else {
      res.send(mainResult);
    }

  });
};*/

var login = function (req, res, next) {
  let user = req.body.form_data;
  let options = {};
  let query = {
    $or: [{ email: user.email }, { email: user.email.toLowerCase() }],
    password: $general.encrypt(user.password)
  };

  try {
    $async.waterfall([
      function (callback) {
        $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, query, options, function (result) {
          callback(null, result);
        });
      },
      function (userResult, callback) {
        if (userResult.length > 0) {
          $async.parallel({
            organizations: function (cb) {
              $organization.getList({
                _id: userResult[0].organizationId
              }, function (result) {
                cb(null, result);
              });
            },
            role: function (cb) {
              $role._get({
                _id: userResult[0].role_id
              }, {}, function (result) {
                cb(null, result);
              });
            }
          }, function (err, result) {
            callback(null, userResult, result);
          });

        } else {
          callback(null, []);
        }
      }], function (err, userResult, result) {
        let userObj = {};
        let returnVal = {};
        returnVal.userfound = false;

        if (userResult.length > 0) {
          returnVal.userfound = true;

          userObj.name = userResult[0].name;
          userObj.lastName = !__util.isNullOrEmpty(userResult[0].lastName) ? userResult[0].lastName : "";
          userObj.email = userResult[0].email;
          userObj.isAdmin = userResult[0].isAdmin;
          userObj.pin = userResult[0].pin;
          userObj.roleId = !__util.isNullOrEmpty(userResult[0].role_id) ? userResult[0].role_id : "";
          userObj.role = result.role[0];

          //var firstOrgId = result.organizations.length > 0 ? (result.organizations.length > 1 ? "-1" : result.organizations[0]._id) : '';
          let tokenJSON = {
            uid: userResult[0]._id,
            user: userObj
          };

          var token = $authtoken.generate(tokenJSON);
          res.cookie('token', token);
          res.send(returnVal);
        } else {
          res.send(returnVal);
        }
      });
  } catch (e) {
    console.error('logged user error: ' + e);
    res.send({});
  }
};

/*var get = function (req, res, next) {
  var obj = $authtoken.get(req.cookies.token);
  var uid = obj.uid;
  query = { "_id": uid };

  user.find(query, {}, { lean: true }, function (err, result) {
    if (result.length > 0) {
      $organization.getList({ _id: { $in: result[0].organizationId } }, {}, function (orgs) {
        result[0].organizations = orgs;
        res.send(result);
      });
    } else {
      res.send([]);
    }
  });
};*/

var get = function (req, res, next) {
  let query = {};
  let options = {};

  if (!__util.isNullOrEmpty(req.params.userId)) {
    query._id = req.params.userId;
  } else {
    var obj = $authtoken.get(req.cookies.token);
    query = { "_id": obj.uid };
  }

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, query, options, function (result) {
    if (result.length > 0) {
      query = {};
      query._id = result[0].organizationId;

      $organization.getList(query, function (organizations) {
        result[0].organizations = organizations;
        res.send(result);
      });
    } else {
      res.send([]);
    }
  });
};

var getsession = function (req, res, next) {
  let obj = $authtoken.get(req.cookies.token);

  res.send({
    name: obj.user.name,
    pin: obj.user.pin,
    lastName: !__util.isNullOrEmpty(obj.user.lastName) ? obj.user.lastName : "",
    email: obj.user.email,
    roleId: obj.user.roleId,
    role: {
      name: obj.user.isAdmin && obj.user.role.name.toLowerCase() == 'ili' ? "iliadmin" : obj.user.role.name.toLowerCase(),
      level: obj.user.role.level
    }
  });
};

var getList = function (userIds, cb) {
  let query = {};
  let options = {};
  query._id = userIds;

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, query, options, function (result) {
    cb(result);
  });
};

var _getOrgMembers = function (queryGet, cb) {
  let options = {};
  options.sort = [['name', 'asc']];

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, queryGet, options, function (result) {
    cb(result);
  });
};

var _updateOrgsMembers = function (queryId, dataToUpdate, cb) {
  $db.update(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, queryId, options, dataToUpdate, function (result) {
    cb(result);
  });
};

var _update = function (req, res, next) {
  let query = {};
  let user = {};

  if (!__util.isNullOrEmpty(req.params.userId)) {
    query._id = req.params.userId;
  } else {
    var obj = $authtoken.get(req.cookies.token);
    query = { "_id": obj.uid };
  }

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    user = req.body.form_data;

    if (!__util.isNullOrEmpty(user.password)) {
      user.password = $general.encrypt(user.password);
    }
  }

  $db.update(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, query, options, user, function (result) {
    user = {};
    user._id = result;

    res.send(user);
  });
};

var _saveUserApp = function (datas, cb) {
  // $member.appmember(datas.members, function (memberResult) {
  $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.userapp, datas.apps, function (result) {
    cb(result);
  });
  // });
};

var _saveUserLoc = function (querySave, cb) {
  $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.userlocation, querySave, function (result) {
    cb(result);
  });
};

var getUserApp = function (uaQuery, cb) {
  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.userapp, uaQuery, {}, function (result) {
    cb(result);
  });
};

var getUserlocation = function (ulQuery, ulOptions, cb) {
  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.userlocation, ulQuery, ulOptions, function (result) {
    cb(result);
  });
};

var list = function (req, res, next) {
  query = {};
  var tokenObj = $authtoken.get(req.cookies.token);

  if (req.body.hasOwnProperty("form_data")) {
    query = req.body.form_data;

    if (typeof query.createdby != 'undefined') {
      query.createdby = tokenObj.uid;
    }

  } else if (!req.body.hasOwnProperty("form_data") && !__util.isEmptyObject(req.body)) {
    query = req.body;
  }

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query.organizationId = {
      $in: [req.params.orgId]
    };
  }

  query = _serializeUserPost(query);

  $user._getOrgMembers(query, function (result) {
    if (result && result.length > 0) {
      result = processDecrypt(result);
    }

    res.send(result);
  });
};

var _serializeUserPost = function (query) {
  if (!__util.isEmptyObject(query)) {
    if (query._search || query.nd || query.rows || query.page || query.sidx || query.sord || query.start || query.limit) {
      delete query._search;
      delete query.nd;
      delete query.rows;
      delete query.page;
      delete query.sidx;
      delete query.sord;
      delete query.start;
      delete query.limit;
    }
  }

  return query;
};

var processDecrypt = function (usersData) {
  _.each(usersData, function (userObj) {
    if (userObj && !__util.isNullOrEmpty(userObj.password)) {
      userObj["userPassword"] = $general.decrypt(userObj.password);
    }
  });

  return usersData;
};

var _processUserPin = function (orgMembers) {
  orgMembers = $general.convertToJsonObject(orgMembers);
  var userPin = $general.getDynamicPin();
  var userPinExists = _.findWhere(orgMembers, {
    "pin": userPin
  });

  if (userPinExists) {
    _processUserPin(orgMembers);
  } else {
    return userPin;
  }
};

var appSaveByUser = function (req, res, next) {
  var datas = req.body.form_data;
  
  _saveUserApp(datas, function (result) {
    var user = { "_id": result };

    res.send(user);
  });
};

var _saveUserApp = function (datas, cb) {
  // $member.appmember(datas.members, function (memberResult) {
  $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.userapp, datas.apps, function (result) {
    cb(result);
  });
  // });
};

var createdUserChk = function (req, res, next) {
  var result = false;

  if (req.body.hasOwnProperty("createdby") && !__util.isNullOrEmpty(req.body.createdby)) {
    var tokenObj = $authtoken.get(req.cookies.token);
    result = req.body.createdby !== tokenObj.uid ? true : false;
  }

  res.send({ "result": result });
};

var remove = function (req, res, next) {
  query = {};
  options = {};
  query._id = req.body._id;

  $db.remove(settingsConf.dbname.tilist_users, settingsConf.collections.orgmembers, query, options, function (result) {
    var obj = {"deleted": result};
    res.send(obj);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "login": login,
  "list": list,
  "getLogin": getLogin,
  "login": login,
  "get": get,
  "getsession": getsession,
  "getList": getList,
  "update": _update,
  "_updateOrgsMembers": _updateOrgsMembers,
  "_getOrgMembers": _getOrgMembers,
  "_saveUserApp": _saveUserApp,
  "_saveUserLoc": _saveUserLoc,
  "getUserApp": getUserApp,
  "getUserlocation": getUserlocation,
  "appSaveByUser": appSaveByUser,
  "_saveUserApp": _saveUserApp,
  "createdUserChk": createdUserChk,
  "remove": remove
};
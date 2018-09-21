var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = {};

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    obj = req.body.form_data;
    obj = _setCatilistObj(obj);
  }

  if (obj.hasOwnProperty('userId')) {
    var tokenObj = $authtoken.get(req.cookies.token);
    obj.userId = tokenObj.uid;
  }

  if (__util.isNullOrEmpty(obj._id)) {
    $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.catilist, obj, function (result) {
      var resObj = { "_id": result };

      res.send(resObj);
    });
  } else {
    options = {};
    query = {};
    query._id = obj._id;
    delete obj["_id"];

    updateCatilist(query, options, obj, function (result) {
      var resObj = { "_id": query._id };
      res.send(resObj);
    });
  }
};

var list = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      query = {};

      if (!__util.isNullOrEmpty(req.params.categoryId)) {
        query._id = req.params.categoryId;
      }

      if (!__util.isNullOrEmpty(req.params.orgId)) {
        query.organizationId = req.params.orgId;
      }

      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.catilist, query, options, function (catilists) {
        callback(null, catilists);
      });
    },
    function (catilists, callback) {
      options = {};

      if (__util.isNullOrEmpty(req.params.orgId)) {
        callback(null, catilists, []);
      } else {
        var roleQuery = {};
        roleQuery.orgId = req.params.orgId;

        $page.isRoleGroup(roleQuery, options, 'catilist', function (groups) {
          callback(null, catilists, groups);
        });
      }
    },
    function (catilists, groups, callback) {
      var userIds = _getUserIds(catilists);

      if (userIds.length > 0) {
        $user.getList(userIds, function (users) {
          var list = {};
          users = $general.convertToJsonObject(users);

          catilists.forEach(function (tile) {
            var id = JSON.stringify(tile._id);
            id = JSON.parse(id);

            var isRole = _.findWhere(groups, {
              "linkTo": "catilist",
              "linkId": id
            });

            var user = _.findWhere(users, {
              "_id": tile.userId
            });

            if (isRole) {
              tile.isRoleBased = true;
            } else {
              tile.isRoleBased = false;
            }

            if (user) {
              tile.userName = user.name;
            }
          });

          callback(null, catilists);
        });
      } else {
        callback(null, catilists);
      }
    }], function (err, catilists) {
      res.send(catilists);
    });
};

var _getUserIds = function (catilists) {
  var userIds = [];

  _.each(catilists, function (catilist) {
    userIds.push(catilist.userId);
  });

  return userIds;
};

var _setCatilistObj = function (catlist) {
  if (!__util.isNullOrEmpty(catlist.availableStart)) {
    catlist.availableStart = $general.stringToDate(catlist.availableStart);
  }

  if (!__util.isNullOrEmpty(catlist.availableEnd)) {
    catlist.availableEnd = $general.stringToDate(catlist.availableEnd);
  }

  if (!__util.isNullOrEmpty(catlist.dateCreated)) {
    catlist.dateCreated = $general.stringToDate(catlist.dateCreated);
  }

  if (!__util.isNullOrEmpty(catlist.dateUpdated)) {
    catlist.dateUpdated = $general.stringToDate(catlist.dateUpdated);
  }

  return catlist;
};

var updateCatilist = function (cQuery, cOptions, dataToUpdate, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.catilist, cQuery, cOptions, dataToUpdate, function (result) {
    cb(result);
  });
};

var deleteCatilist = function (req, res, next) {
  query = {};
  options = {};

  var resultObj = { "deleted": false };

  if (!__util.isNullOrEmpty(req.params.categoryId)) {
    query._id = req.params.categoryId;

    $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.catilist, query, options, function (result) {

      resultObj["deleted"] = result;
      res.send(resultObj);
    });
  } else {
    res.send(resultObj);
  }
};

var _getCatilists = function (ids, cb) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.catilist, ids, options, function (result) {
    cb(result);
  });
};


module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "updateCatilist": updateCatilist,
  "deleteCatilist": deleteCatilist,
  "_getCatilists": _getCatilists
};
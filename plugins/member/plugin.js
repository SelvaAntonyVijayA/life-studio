var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var _getMember = function (query, options, cb) {
  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.members, query, options, function (result) {
    cb(result);
  });
};

var savepl = function (req, res, next) {
  let obj = req.body.preferredlocation;

  $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.preferredlocation, obj, function (result) {
    let query = {};
    query.appId = obj.appId;
    query.locationId = obj.locationId;

    $page.getAppMenu(query, function (mainMenu) {
      var pages = [];

      _.each(mainMenu, function (menu) {
        page = {};
        page._id = menu._id;
        page.title = menu.title;
        page.squares = _squares(menu.menuTiles);

        pages.push({
          "page": page
        });
      });

      res.send({ "main_menu": pages });
    });
  });
};

var getpl = function (query, cb) {
  let options = {};

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.preferredlocation, query, options, function (result) {
    cb(result);
  });
};

var _savepl = function (obj, cb) {
  $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.preferredlocation, obj, function (result) {

    if (cb) {
      cb(result);
    }
  });
};

var getAssignedPl = function (req, res, next) {
  let query = {};
  query.locationId = req.params.locationid;

  getpl(query, function (pls) {
    res.send(pls);
  });
};

var removePl = function (id, cb) {
  let query = {};
  let options = {};
  query._id = id;

  $db.remove(settingsConf.dbname.tilist_users, settingsConf.collections.preferredlocation, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    if (cb) {
      cb(obj);
    }
  });
};

var getpreferredlocation = function (req, res, next) {
  let query = {};
  query.appId = req.params.appid;
  query.memberId = req.params.memberid;

  getpl(query, function (pLocation) {
    if (__util.isEmptyObject(pLocation)) {
      query = {};
      query.appId = req.params.appid;

      $location.getList(query, function (locationByAppId) {
        if (locationByAppId.length == 1) {
          let obj = {};
          obj.appId = req.params.appid;
          obj.memberId = req.params.memberid;
          obj.locationId = locationByAppId[0]._id.toString();

          _savepl(obj);

          res.send(obj);
        } else {
          res.send(locationByAppId);
        }
      });
    } else {
      res.send(pLocation[0]);
    }
  });
};

var savepreferredlocation = function (req, res, next) {
  let obj = req.body.form_data;

  _savepl(obj, function (result) {
    res.send(result);
  });
};

var squareAssign = function (req, res, next) {
  let datas = req.body.form_data;
  let count = 0;
  let html = "<div>";
  let success = true;

  $async.each(datas, function (data, cb) {
    let query = {};
    query._id = data.userId;
    let options = {
      "upsert": true
    };

    let updateObj = {};
    updateObj.appId = data.appId;

    if (data.squares) {
      let squareObj = data.squares;

      if (squareObj) {
        updateObj.squares = squareObj.squares;
      }
    }

    if (data.role) {
      let roleObj = data.role;

      if (roleObj) {
        updateObj.role = roleObj.role;
      }
    }

    _update(query, options, updateObj, function (updateResult) {
      count++;
      if (updateResult.success) {
        html += "<p><b>Record:" + count + " </b>&nbsp;&nbsp;";
        html += "<b>Message: </b>&nbsp;&nbsp;";
        html += "Success<br><br></p>";
      } else {
        if (success == true) {
          success = false;
        }

        html += "<p><b>Record:" + count + " </b>&nbsp;&nbsp;";
        html += "<b>Message: </b>&nbsp;&nbsp;";
        html += "" + updateResult.message + "<br><br></p>";
      }
      cb();
    });
  }, function () {
    let obj = {};
    obj.success = success;
    obj.message = html;

    res.send(obj);
  });
};

var _update = function (query, options, memberData, cb) {
  if (memberData.password && !__util.isNullOrEmpty(memberData.password)) {
    memberData["password"] = memberData.password;
  }

  delete memberData["loginPassword"];
  delete memberData["memberEmail"];
  delete memberData["decryptedPassword"];

  memberData.id = query._id;
  memberData._id = query._id;

  memberData = lastDateUpdatePropAssign(memberData);

  $datamigration.userSave(memberData, function (migrate) {
    if (migrate.success) {
      delete memberData["_id"];

      if (!__util.isNullOrEmpty(memberData.password)) {
        memberData.password = $general.encrypt(memberData.password);
      }

      let options = {};

      _updateWithBannedList(query._id, query, options, memberData, function (result) {
        cb({
          "success": true,
          "_id": query._id
        });
      });

    } else {
      cb(migrate);
    }
  });
};

var _updateWithBannedList = function (_id, query, options, obj, cb) {
  $async.waterfall([
    function (callback) {
      $db.update(settingsConf.dbname.tilist_users, settingsConf.collections.members, query, options, obj, function (updateResult) {
        callback(null, updateResult);
      });
    },
    function (updateResult, callback) {
      let bannedQuery = {};
      bannedQuery = {
        authKey: $general.hashMD5(_id.toString()),
        status: {
          $exists: false,
        }
      };

      let options = {};
      options.sort = [['_id', -1]];

      $pubnub.getChatBannedByUser(bannedQuery, options, function (bannedList) {
        callback(null, bannedList)
      });
    }], function (err, bannedList) {
      if (bannedList && bannedList.length > 0 && !__util.isNullOrEmpty(obj.nickName)) {
        bannedList = $general.convertToJsonObject(bannedList);
        bannedList = _.filter(bannedList, function (obj) {
          return obj.status != "allowed";
        });

        var bannedData = bannedList[0];

        var objNew = {
          "uuid": obj.nickName,
          "memberId": _id.toString()
        };

        var banQuery = {
          _id: bannedData._id.toString()
        }

        $pubnub.updateBannedUser(banQuery, { multi: true }, objNew, function () {
          if (cb) {
            cb({
              "success": true,
              "_id": _id.toString()
            });
          }
        });

      } else {
        cb({
          "success": true,
          "_id": _id.toString()
        });
      }
    });
};

module.exports = {
  "init": init,
  "_getMember": _getMember,
  "removePl": removePl,
  "savepl": savepl,
  "getpl": getpl,
  "getpreferredlocation": getpreferredlocation,
  "savepreferredlocation": savepreferredlocation,
  "squareAssign": squareAssign,
  "getAssignedPl": getAssignedPl,
};
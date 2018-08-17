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

var getProfile = function (req, res, next) {
  var url = settingsConf.authDomain + "/migrate/get_app_structure/" + req.params.appId;

  $general.profileDynamicFields(url, function (fieldData) {
    res.send({
      fields: fieldData,
      userColModel: _getUserTableModel(fieldData)
    });
  });
};

var _getUserTableModel = function (fields) {
  var columnModel = [{
    name: '_id',
    index: '_id',
    sortable: false,
    hidden: true,
    key: true
  }, {
    label: 'allFieldsString',
    name: 'allFieldsString',
    sortable: false,
    hidden: true
  }];

  _.each(fields, function (field) {
    var name = !__util.isNullOrEmpty(field.name) ? field.name : "";
    var width = name.length * 11;

    if (field.tag !== "password") {
      var cModel = {
        label: name,
        name: field.tag,
        editable: true,
        width: width,
        sortable: true
      };

      columnModel.push(cModel);
    }
  });

  return columnModel;
};

var getRoleMembers = function (req, res, next) {
  query = {};
  options = {};
  var memberData = req.body.form_data;

  query = {
    "login.type": "ili",
    "role.roleId": {
      $exists: true,
      $in: [memberData.roleId]
    },
    "appId": memberData.appId
  };

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.members, query, options, function (result) {
    res.send(result);
  });
};

var getMemberbyApp = function (req, res, next) {
  $async.parallel({
    profile: function (callback) {
      var language = "en";
      var options = {
        url: settingsConf.authDomain + '/migrate/get_app_structure/' + req.params.appId + '/' + language,
        method: "GET"
      };

      $general.getUrlResponseWithSecurity(options, function (error, response, body) {
        if (error) {
          $log.error("migrate org structure API: " + error);
        }

        if (!error && response.statusCode == 200) {
          callback(null, JSON.parse(body));

        } else {
          callback(null, []);
        }
      });
    },
    member: function (callback) {
      query = {};

      if (!__util.isNullOrEmpty(req.params.appId)) {
        query = {
          "appId": req.params.appId
        };
      }

      if (!__util.isNullOrEmpty(req.params.locationId)) {

        if (req.params.locId == "-1") {
          query["$or"] = [{ locationId: { $exists: false } }, { locationId: "0" }, { locationId: "-1" }];

          query["type"] = {
            $ne: "others"
          };

        } else {
          query["locationId"] = req.params.locationId;
        }
      }

      if (!__util.isNullOrEmpty(req.body.form_data)) {
        query = req.body.form_data;
      }

      options = {};
      options.sort = [['firstName', 'asc']];

      _getMember(query, options, function (members) {
        callback(null, members);
      });
    }
  }, function (err, data) {
    var members = [];

    if (data.member.length > 0) {
      members = _memberProcessing(data.member, data.profile);
    }

    res.send(members);
  });
};

var _memberProcessing = function (members, profile) {
  var filteredMembers = [];

  _.each(members, function (mem) {
    var password = !__util.isNullOrEmpty(mem.password) ? mem.password : "";
    var decryptedPassword = !__util.isNullOrEmpty(password) ? $general.decrypt(password) : "";

    mem["decryptedPassword"] = decryptedPassword;

    var squareTypeIds = [];

    if (!__util.isEmptyObject(mem.squares) && mem.squares.length > 0) {
      _.each(mem.squares, function (square) {
        var sqTypId = square.squareId + "_" + square.type;
        squareTypeIds.push(sqTypId);
      });

      mem["squareTypeId"] = squareTypeIds;
    } else {
      mem["squareTypeId"] = [];
    }

    if (!__util.isEmptyObject(mem.role) && mem.role.length > 0) {
      var role = mem.role[0];

      mem["memberRoleId"] = role.roleId;
      mem["isManager"] = typeof role.isManager != "undefined" && !__util.isNullOrEmpty(role.isManager) ? role.isManager : false;

    } else {
      mem["memberRoleId"] = "";
    }

    mem["allFieldsString"] = JSON.stringify(mem);

    if (profile.length > 0) {
      var isValidate = memberProfileCheck(profile, mem, true);

      if (isValidate.isProfile) {
        if (!__util.isEmptyObject(isValidate.dateObj)) {

          var dkeys = Object.keys(isValidate.dateObj);

          _.each(dkeys, function (dkey) {
            mem[dkey] = !__util.isNullOrEmpty(mem[dkey]) ? new Date(mem[dkey]) : "";
          });
        }

        filteredMembers.push(mem);
      }
    }

    if (profile.length == 0) {
      filteredMembers.push(mem);
    }
  });

  return filteredMembers;
};

var memberProfileCheck = function (fields, memberData, dateCheck) {
  var isProfile = false;
  var dateValueObject = {};

  _.each(fields, function (field) {
    var blockValue = "";

    if (field.tag !== "password") {

      if (memberData && !__util.isEmptyObject(memberData)) {
        if (field.tag == "email") {
          blockValue = !__util.isEmptyObject(memberData.login) && __util.isArray(memberData.login) && !__util.isNullOrEmpty(memberData.login[0]["email"]) ? memberData.login[0]["email"] : "";

          if (__util.isNullOrEmpty(blockValue)) {
            blockValue = !__util.isNullOrEmpty(memberData[field.tag]) ? memberData[field.tag] : "";
          }

        } else {
          blockValue = !__util.isNullOrEmpty(memberData[field.tag]) ? memberData[field.tag] : "";

          if (field.type == "date") {
            dateValueObject[field.tag] = blockValue;
          }
        }
      }

      if (!__util.isNullOrEmpty(blockValue)) {
        isProfile = true;

      } else {
        if (isProfile == false) {
          isProfile = false;
        }
      }
    }
  });

  if (dateCheck) {
    return { isProfile: isProfile, dateObj: dateValueObject };

  } else {
    return isProfile;
  }
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
  "getProfile": getProfile,
  "getRoleMembers": getRoleMembers,
  "getMemberbyApp": getMemberbyApp
};
var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  let obj = {};
  let tokenObj = $authtoken.get(req.cookies.token);

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    obj = req.body.form_data;
    obj = _setStreamObj(obj);
  }

  if (__util.isNullOrEmpty(obj._id)) {
    obj["createdBy"] = tokenObj.uid;
    obj["userId"] = tokenObj.uid;

    $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.livestream, obj, function (result) {

      obj = {};
      obj._id = result;

      res.send(obj);
    });
  } else {
    let options = {};
    let query = {};
    query._id = obj._id;
    obj["updatedBy"] = tokenObj.uid;
    delete obj["_id"];

    updateLiveStream(query, options, obj, function (result) {
      obj = {};
      obj._id = query._id;

      res.send(obj);
    });
  }
};

var list = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query.organizationId = req.params.orgId;
  }

  if (!__util.isNullOrEmpty(req.params.appId)) {
    query["createdApp.id"] = req.params.appId;
  }

  if (!__util.isNullOrEmpty(req.params.locationId)) {
    query["locationId"] = req.params.locationId;
  }

  if (req.body.hasOwnProperty('form_data')) {
    query = req.body.form_data;
  }

  if ((!req.body.hasOwnProperty("form_data") && !__util.isEmptyObject(req.body)) || query.hasOwnProperty('assignedUserIds')) {
    if (!query.hasOwnProperty('assignedUserIds')) {
      query = req.body;
    }

    var tokenObj = $authtoken.get(req.cookies.token);

    query.assignedUserIds = {
      $exists: true,
      $in: [tokenObj.uid]
    };
  }

  if (!__util.isNullOrEmpty(query.start)) {
    delete query.start;
  }

  if (!__util.isNullOrEmpty(query.limit)) {
    delete query.limit;
  }

  options.sort = [['_id', 'desc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.livestream, query, options, function (result) {
    res.send(result);
  });
};

var updateLiveStream = function (lQuery, lOptions, data, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.livestream, lQuery, lOptions, data, function (result) {
    cb(result);
  });
};

var get = function (lQuery, callback) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.livestream, lQuery, options, function (result) {
    callback(result);
  });
};

var update = function (req, res, next) {
  query = {};
  var obj = {};
  query._id = req.params.livestreamId;

  options = {
    multi: true
  };

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    obj = req.body.form_data;
    obj = _setStreamObj(obj);

    var tokenObj = $authtoken.get(req.cookies.token);
    obj["updatedBy"] = tokenObj.uid;
  }

  $async.parallel({
    languages: function (callback) {
      $languages._get({}, function (languages) {
        callback(null, languages);
      });
    },
    livestream: function (callback) {
      updateLiveStream(query, options, obj, function (result) {
        callback(null, result);
      });
    }
  }, function (err, result) {
    if (!__util.isNullOrEmpty(req.params.appId) && obj.isEmoticons) {
      var emoticonsList = [];
      emoticonsList = concat.call(emoticonsList, obj.emoticons);

      _.each(result.languages, function (language) {
        if (obj[language.code] && obj[language.code].emoticons) {
          var emoticonsByLanguage = obj[language.code].emoticons;
          emoticonsList = concat.call(emoticonsList, emoticonsByLanguage);
        }
      });

      var mobilePostData = {
        "appId": req.params.appId,
        "livestreamId": req.params.livestreamId,
        "emoticons": emoticonsList
      };

      _postEmoticonsToMobile(mobilePostData);
    }

    var liveStreamResult = { "_id": result.livestream };
    res.send(liveStreamResult);
  });
};

var groupUpdate = function (req, res, next) {
  let query = {};
  let options = {};
  let obj = {};
  query._id = req.params.id;

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    obj = req.body.form_data;
  }

  $async.waterfall([
    function (callback) {
      get(query, function (liveStreamData) {
        callback(null, liveStreamData);
      });
    },
    function (liveStreamData, callback) {
      let liveStream = liveStreamData[0];
      let streamSquares = [];
      let currentDateTime = _getCurrentUtcDateTime();

      if (liveStream.streamSquare) {
        for (var i = 0; i < liveStream.streamSquare.length; i++) {
          let square = liveStream.streamSquare[i];
          let match = _.findWhere(obj.streamSquare, {
            'id': square.id,
            'type': square.type
          });

          let streamObj = {};
          let isDeactivated = match && !__util.isNullOrEmpty(square.deactivatedTime) && !__util.isNullOrEmpty(match.deactivatedTime);
          let isActivated = match && !__util.isNullOrEmpty(square.availableFrom) && !__util.isNullOrEmpty(match.availableFrom);

          if (match) {
            if (isDeactivated || isActivated) {
              streamObj = square;
            } else {
              streamObj = match;
            }

            if (!__util.isNullOrEmpty(square.showName)) {
              streamObj.showName = match.showName;
            }

            if (match.isActive != square.isActive) {
              if (!__util.isNullOrEmpty(match.deactivatedTime)) {
                streamObj.deactivatedTime = currentDateTime;
              }

              if (!__util.isNullOrEmpty(match.availableFrom)) {
                streamObj.availableFrom = currentDateTime;
              }
            }

            streamObj.isActive = match.isActive;

          } else {
            streamObj = square;
          }

          var isExits = _.findWhere(streamSquares, {
            'id': streamObj.id,
            'type': streamObj.type
          });

          if (!isExits) {
            streamSquares.push(streamObj);
          }
        }

        for (var j = 0; j < obj.streamSquare.length; j++) {
          var squareData = obj.streamSquare[j];

          var match = _.findWhere(streamSquares, {
            'id': squareData.id,
            'type': squareData.type
          });

          if (!match) {
            if (!__util.isNullOrEmpty(squareData.deactivatedTime)) {
              squareData.deactivatedTime = currentDateTime;
            }

            if (!__util.isNullOrEmpty(squareData.availableFrom)) {
              squareData.availableFrom = currentDateTime;
            }

            streamSquares.push(squareData);
          }
        }
      } else {
        for (var i = 0; i < obj.streamSquare.length; i++) {
          var square = obj.streamSquare[i];

          if (!__util.isNullOrEmpty(square.deactivatedTime)) {
            square.deactivatedTime = currentDateTime;
          }

          if (!__util.isNullOrEmpty(square.availableFrom)) {
            square.availableFrom = currentDateTime;
          }

          streamSquares.push(square);
        }
      }

      callback(null, streamSquares);
    }], function (error, streamSquare) {
      query = {};
      query._id = req.params.id;
      obj = {};
      obj.streamSquare = streamSquare;
      let tokenObj = $authtoken.get(req.cookies.token);
      obj["updatedBy"] = tokenObj.uid;

      updateLiveStream(query, options, obj, function (result) {
        obj = {};
        obj._id = query._id;

        res.send(obj);
      });
    });
};

var _postEmoticonsToMobile = function (data, cb) {
  var options = {
    url: appconf.authDomain + "/credits/set_emoticons",
    method: "POST",
    json: data
  };

  $general.getUrlResponseWithSecurity(options, function (err, res, body) {
    if (err) {
      $log.error("Error : Emoticons post to mobile: " + JSON.stringify(err));

    } else if (res.statusCode != 200) {
      $log.error("Error : Emoticons post to mobile: " + res.statusCode);
    }

    if (cb) {
      cb();
    }
  });
};

var remove = function (req, res, next) {
  let query = {};
  let options = {};

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    query = req.body.form_data;
  } else {
    query._id = req.params.id;
  }

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.livestream, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var byId = function (req, res, next) {
  let query = {};
  let options = {};
  query._id = req.params.id;

  $db.select(settingsConf.dbname.tilist_core, settingsConf.auth, settingsConf.collections.livestream, query, options, function (result) {
    res.send(result);
  });
};

var like = function (req, res, next) {
  likeUnlike(req, res, next, true);
};

var unlike = function (req, res, next) {
  likeUnlike(req, res, next, false);
};

var liveStreamMapping = function (req, res, next) {
  let obj = req.body.form_data;

  $async.each(obj.streams, function (id, cbk) {
    let options = {};
    let query = {};
    query._id = id;

    let datas = {};
    datas.assignedUserIds = obj.userId;
    var dataToUpdate = {};

    if (obj.operation == 'push') {
      dataToUpdate = {
        $addToSet: datas
      };
    } else {
      dataToUpdate = {
        $pull: datas
      };
    }

    updateLiveStream(query, options, dataToUpdate, function (result) {
      cbk();
    });

  }, function (err) {
    res.send({
      'status': 'success'
    })
  });
};

var streamUserRightMapping = function (req, res, next) {
  if (__util.isNullOrEmpty(req.params.orgId) || __util.isNullOrEmpty(req.params.userId) || __util.isNullOrEmpty(req.params.roleId)) {
    res.status(404).send('404 Page Not Found.');
    return;
  }

  var orgId = req.params.orgId;
  var userId = req.params.userId;
  var roleId = req.params.roleId;
  let query = {};
  let options = {};

  $async.waterfall([
    function (callback) {
      query = {};
      options = {};
      query._id = roleId;

      $role._get(query, options, function (roles) {
        callback(null, roles);
      });
    },
    function (roles, callback) {
      if (roles.length > 0) {
        query = {};
        options = {};
        query._id = roles[0].rights;

        $access._getAccess(query, function (accesses) {
          callback(null, roles, accesses);
        });
      }

    }], function (error, roles, accesses) {
      if (roles.length > 0 && accesses.length > 0) {
        let updateQuery = {};
        updateQuery._id = userId;
        let dataToUpdate = {};

        let accessIds = [];

        _.each(accesses, function (access) {
          let obj = {};
          obj._id = access._id.toString();
          obj.name = access.name;
          accessIds.push(obj);
        });

        dataToUpdate.assignedAccess = accessIds;
        dataToUpdate.isAdmin = false;

        $user._updateOrgsMembers(updateQuery, dataToUpdate, function (result) {
          res.send({
            'status': true
          });
        });
      } else {
        res.send({
          'status': false
        });
      }
    });
};

var likeUnlike = function (req, res, next, isLike) {
  let options = {};
  let query = {};
  query._id = req.params.id;

  if (__util.isNullOrEmpty(query._id)) {
    res.status(404).send('404 Page Not Found.');
  }

  let obj = {};

  if (!isLike) {
    query.likes = {
      $gt: 0
    };

    obj = {
      $inc: {
        "likes": -1
      }
    };
  } else {
    obj = {
      $inc: {
        "likes": 1
      }
    };
  }

  updateLiveStream(query, options, obj, function (result) {
    let obj = {};
    obj._id = query._id;

    res.send(obj);
  });
};

var _setStreamObj = function (data) {
  if (!__util.isNullOrEmpty(data.createdOn)) {
    data.createdOn = $general.stringToDate(data.createdOn);
  }

  if (!__util.isNullOrEmpty(data.updatedOn)) {
    data.updatedOn = _getCurrentUtcDateTime();
  }

  if (!__util.isNullOrEmpty(data.talentBioUpdated)) {
    data.talentBioUpdated = _getCurrentUtcDateTime();
  }

  if (!__util.isNullOrEmpty(data.channelInfoUpdated)) {
    data.channelInfoUpdated = _getCurrentUtcDateTime();
  }

  return data;
};

var _getCurrentUtcDateTime = function () {
  return (new Date((new Date()).toUTCString()));
};

var mappedStreamlist = function (req, res, next) {
  query = {};
  query = {
    assignedUserIds: {
      $exists: true,
      $in: [req.params.userId]
    }
  };

  get(query, function (result) {
    res.send(result);
  });
};

module.exports = {
  "init": init,
  "list": list,
  "updateLiveStream": updateLiveStream,
  "liveStreamMapping": liveStreamMapping,
  "get": get,
  "save": save,
  "remove": remove,
  "groupUpdate": groupUpdate,
  "like": like,
  "unlike": unlike,
  "byId": byId,
  "update": update,
  "mappedStreamlist": mappedStreamlist,
  "streamUserRightMapping": streamUserRightMapping
};
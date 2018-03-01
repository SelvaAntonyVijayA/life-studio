var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
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

    var liveStreamResult = {"_id": result.livestream};
    res.send(liveStreamResult);
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

module.exports = {
  "init": init,
  "list": list,
  "updateLiveStream": updateLiveStream,
  "get": get,
  "update": update
};
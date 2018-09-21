var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      query = {};
      options = {};

      if (!__util.isNullOrEmpty(req.params.appId)) {
        query.appId = req.params.appId;
      }

      if (!__util.isNullOrEmpty(req.params.tileId)) {
        query.tileId = req.params.tileId;
      }

      if (!__util.isNullOrEmpty(req.params.type)) {
        query.type = req.params.type;
      }

      query.moderated = "true";
      options.sort = [['updatedOn', 'desc']];

      _getMedia(query, options, function (mediaList) {
        callback(null, mediaList);
      });
    },
    function (mediaList, callback) {
      if (mediaList.length > 0) {

        _getMemberIds(mediaList, function (memberIds, videoIds, userIds, orgUserIds) {
          callback(null, mediaList, memberIds, userIds, orgUserIds);
        });

      } else {
        callback(null, mediaList, [], [], []);
      }
    },
    function (mediaList, memberIds, userIds, orgUserIds, callback) {
      $async.parallel({
        users: function (done) {

          if (userIds.length > 0) {
            $user.getList(userIds, function (users) {
              var list = {};
              users = JSON.stringify(users);
              users = JSON.parse(users);

              done(null, users);
            });

          } else {
            done(null, []);
          }
        },
        members: function (done) {
          if (memberIds.length > 0) {
            var memberQuery = {};
            memberQuery._id = memberIds;

            $member._getMember(memberQuery, {}, function (members) {
              members = JSON.stringify(members);
              members = JSON.parse(members);

              done(null, members);
            });

          } else {
            done(null, []);
          }
        },
        orgmembers: function (done) {

          if (orgUserIds.length > 0) {
            $user.getList(orgUserIds, function (orgmembers) {
              done(null, $general.convertToJsonObject(orgmembers));
            });

          } else {
            done(null, []);
          }
        }
      }, function (err, results) {
        callback(null, mediaList, results);
      });

    }], function (err, mediaList, datas) {
      var members = datas.members;
      var users = datas.users;

      mediaList.forEach(function (media) {
        var member = _.findWhere(members, {
          "_id": media.memberId
        });

        if (member) {
          media.memberName = _getMemberName(member);
        }

        if (media.hasOwnProperty("reviewedBy")) {
          var user = _.findWhere(datas.orgmembers, {
            "_id": media.reviewedBy
          });

          if (user) {
            media.reviewedBy = _getMemberName(user);
          }
        }

        if (media.hasOwnProperty("inappropriateBy")) {
          var user = _.findWhere(datas.orgmembers, {
            "_id": media.inappropriateBy
          });

          if (user) {
            media.inappropriateBy = _getMemberName(user);
          }
        }

        if (media.hasOwnProperty("activatedBy")) {
          var user = _.findWhere(users, {
            "_id": media.activatedBy
          });

          if (user) {
            media["userName"] = user.name;
          }
        }
      });

      res.send(mediaList);
    });
};

var _getMedia = function (queryGet, options, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.media, queryGet, options, function (result) {
    cb(result);
  });
};

var _getMemberIds = function (datas, cb) {
  var ids = [];
  var videoIds = [];
  var userIds = [];
  var orgUserIds = [];

  _.each(datas, function (data) {
    ids.push(data.memberId);

    if (data.type == "eventvideo" || data.type == "formvideo") {
      var videoId = data.videoId.indexOf(":") !== -1 ? data.videoId.split(":")[0] : data.videoId;

      videoIds.push("video_" + videoId);

    } else if (data.type == "eventphoto") {
      videoIds.push("video_" + data._id.toString());
    }

    if (data.hasOwnProperty("activatedBy")) {
      userIds.push(data.activatedBy)
    }

    if (data.hasOwnProperty("reviewedBy")) {
      orgUserIds.push(data.reviewedBy)
    }

    if (data.hasOwnProperty("inappropriateBy")) {
      orgUserIds.push(data.inappropriateBy)
    }

  });

  cb(ids, videoIds, userIds, orgUserIds);
};

var _getMemberName = function (member) {
  var name = "";

  if (!__util.isNullOrEmpty(member.firstName)) {
    name = member.firstName;
  }

  if (!__util.isNullOrEmpty(member.name)) {
    name = member.name;
  }

  if (!__util.isNullOrEmpty(member.lastName)) {
    name += " " + member.lastName;
  }

  if (__util.isNullOrEmpty(name)) {
    name = !__util.isNullOrEmpty(member.nickName) ? member.nickName : "";
  }

  return name;
};

module.exports = {
  "init": init,
  "_getMedia": "_getMedia",
  "list": list
};
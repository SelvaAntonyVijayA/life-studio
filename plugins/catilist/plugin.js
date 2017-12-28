var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
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

module.exports = {
  "init": init,
  "list": list
};
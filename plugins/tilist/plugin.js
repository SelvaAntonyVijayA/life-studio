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
      options = {};

      if (!__util.isNullOrEmpty(req.params.orgId)) {
        query.organizationId = req.params.orgId;
      }

      if (!__util.isNullOrEmpty(req.params.tilistId)) {
        query._id = req.params.tilistId;
      }

      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tilist, query, options, function (tilist) {
        callback(null, tilist);
      });
    },
    function (tilist, callback) {
      if (__util.isNullOrEmpty(req.params.orgId)) {
        callback(null, tilist, []);
      } else {
        options = {};
        var roleQuery = {};
        roleQuery.orgId = req.params.orgId;

        $page.isRoleGroup(roleQuery, options, 'tilist', function (groups) {
          callback(null, tilist, groups);
        });
      }
    },
    function (tilists, groups, callback) {
      tilists.forEach(function (tilist) {
        var id = JSON.stringify(tilist._id);
        id = JSON.parse(id);

        var isRole = _.findWhere(groups, {
          "linkTo": "tilist",
          "linkId": id
        });

        if (isRole) {
          tilist.isRoleBased = true;
        } else {
          tilist.isRoleBased = false;
        }
      });

      callback(null, tilists);
    }], function (err, tilists) {
      res.send(tilists);
    });
};

module.exports = {
  "init": init,
  "list": list
};
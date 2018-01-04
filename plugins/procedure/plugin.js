var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  var dtype = req.query.dtype;

  console.dir(dtype);

  $async.waterfall([
    function (callback) {
      query = {};
      options = {};

      if (!__util.isNullOrEmpty(req.params.orgId)) {
        query.organizationId = req.params.orgId;
      }

      if (!__util.isNullOrEmpty(req.params.procedureId)) {
        query._id = req.params.procedureId;
      }

      if (!__util.isNullOrEmpty(dtype)) {
        query.type = dtype;
      }

      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.procedure, query, options, function (procedures) {
        callback(null, procedures);
      });
    },
    function (procedures, callback) {
      if (__util.isNullOrEmpty(req.params.orgId)) {
        callback(null, procedures, []);

      } else {
        options = {};
        var roleQuery = {};
        roleQuery.orgId = req.params.orgId;

        $page.isRoleGroup(roleQuery, options, (dtype ? dtype : "procedure"), function (groups) {
          callback(null, procedures, groups);
        });
      }
    },
    function (procedures, groups, callback) {
      procedures.forEach(function (procedure) {
        var isRole = _.findWhere(groups, {
          "linkTo": (dtype ? dtype : "procedure"),
          "linkId": procedure._id.toString()
        });

        if (isRole) {
          procedure.isRoleBased = true;

        } else {
          procedure.isRoleBased = false;
        }
      });

      callback(null, procedures);
    }], function (err, procedures) {
      res.send(procedures);
    });
};

module.exports = {
  "init": init,
  "list": list
};
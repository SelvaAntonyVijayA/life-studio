// var path = require("path");
// var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var event = require(path.join(process.cwd(), 'models', 'event'));

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

      if (!__util.isNullOrEmpty(req.params.eventId)) {
        query._id = req.params.eventId;
      }

      //options.lean = true;
      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.event, query, options, function (events) {
        callback(null, events);
      });
    },
    function (events, callback) {
      if (__util.isNullOrEmpty(req.params.orgId)) {
        callback(null, events, []);
      } else {
        options = {};
        var roleQuery = { "orgId": req.params.orgId };

        $page.isRoleGroup(roleQuery, options, 'event', function (groups) {
          callback(null, events, groups);
        });
      }
    },
    function (events, groups, callback) {
      events.forEach(function (event) {
        var id = JSON.stringify(event._id);
        id = JSON.parse(id);

        var isRole = _.findWhere(groups, {
          "linkTo": "event",
          "linkId": id
        });

        if (isRole) {
          event.isRoleBased = true;
        } else {
          event.isRoleBased = false;
        }
      });

      callback(null, events);
    }], function (err, events) {
      res.send(events);
    });
};

module.exports = {
  "init": init,
  "list": list
};
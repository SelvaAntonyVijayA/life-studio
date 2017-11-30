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

      getEvent(query, options, function (events) {
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

var getEvent = function (evtQuery, evtOpts, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.event, evtQuery, evtOpts, function (events) {
    cb(events);
  });
};

var eventByTiles = function (req, res, next) {
  var eventId = req.body.eventId;
  var isTile = req.body.isTile;

  $async.waterfall([
    function (callback) {
      query = { "_id": eventId };
      options = {};

      getEvent(query, options, function (event) {
        callback(null, event);
      });
    },
    function (event, callback) {
      if (isTile && event && event[0] && event[0].hasOwnProperty("tiles") && event[0].tiles.length > 0) {
        var tileIds = [];

        _.each(event[0].tiles, function (tile) {
          if (tile && tile.hasOwnProperty("_id")) {
            tileIds.push(tile._id)
          }
        });

        if (tileIds.length > 0) {
          query = { "_id": tileIds };
          options = {};
          var tileFields = { "_id": 1, "title": 1, "art": 1 };

          $tile.getSpecificFields(tileFields, query, options, function (tiles) {
            callback(null, event, tiles);
          });
        }
      } else {
        callback(null, event, []);
      }
    },
    function (event, tiles, callback) {
      var result = {
        "event": event,
        "tiles": tiles
      };

      callback(null, result);
    }], function (err, result) {
      res.send(result);
    });
};

module.exports = {
  "init": init,
  "eventByTiles": eventByTiles,
  "list": list
};
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

var get = function (req, res, next) {
  query = {};
  options = {};
  query._id = req.params.eventId;

  var context = { "req": req, "res": res, "next": next };

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.event, query, options, function (result) {
    _eventTile(context, result);
  });
};

var _eventTile = function (context, event) {
  var tileIds = [];
  var res = context.res;
  var req = context.req;
  var isTiles = !__util.isNullOrEmpty(req.params.isTiles) && req.params.isTiles ? true : false;
  var categoryIds = [];

  //console.dir(isTiles);

  if (event && event.length > 0) {
    event[0].tiles.forEach(function (tile) {
      tileIds.push(tile._id);
    });

    query = { "_id": tileIds };
    options = {};
    var tileFields = { "_id": 1, "title": 1, "category": 1, "art": 1 };

    $tile.getSpecificFields(tileFields, query, options, function (tiles) {
      //var eventTiles = [];
      tiles = $general.convertToJsonObject(tiles)

      _.each(tileIds, function (id) {
        var tileObj = _.findWhere(tiles, {
          _id: id
        });

        if (tileObj) {
          var tileResult = _.findWhere(event[0].tiles, {
            "_id": tileObj._id
          });

          var trigger = tileResult.triggerdata;
          var status = "";
          var activate = !(trigger.availableFrom && (new Date(trigger.availableFrom)) < (new Date()));
          var deactivate = trigger.deactivatedTime ? ((new Date(trigger.deactivatedTime)) < (new Date())) : false;

          if (activate && !deactivate) {
            status = "activate";
          }

          if (deactivate) {
            status = "reactivate";
          }

          if (!activate && !deactivate) {
            status = "deactivate";
          }

          if (isTiles) {
            var evtCatId = tileObj.hasOwnProperty("category") && !__util.isNullOrEmpty(tileObj["category"]) ? tileObj["category"] : "-1";

            if (evtCatId !== "-1") {
              categoryIds.push(evtCatId);
            }
          }

          tileResult.tileData = tileObj;
          tileResult.tileActivate = activate;
          tileResult.tileDeActivate = deactivate;
          tileResult.status = status;

          //eventTiles.push(tileResult);
        }
      });

      //event.tileList = eventTiles;

      if (isTiles && categoryIds.length > 0) {
        query = { "_id": categoryIds };
        options = {};
        $tilecategory.getCategories(query, options, function (tileCatRes) {
          var tileCategories = $general.convertToJsonObject(tileCatRes);

          _.each(event[0].tiles, function (tileObj) {
            if (tileObj && tileObj.hasOwnProperty(tileData) && tileObj["tileData"].hasOwnProperty("category") && !__util.isNullOrEmpty(tileObj["tileData"]["category"])) {
              let index = tileCategories.map(function (t) { return t['_id']; }).indexOf(tileObj["tileData"]["category"]);

              if (index !== -1) {
                tileObj["tileData"]["categoryName"] = tileCategories[index]["name"];
              }
            }
          });

          res.send(event);
        });
      } else {
        res.send(event);
      }

      //console.dir(event);
    });
  } else {
    res.send([]);
  }
};

module.exports = {
  "init": init,
  "eventByTiles": eventByTiles,
  "list": list,
  "get": get
};
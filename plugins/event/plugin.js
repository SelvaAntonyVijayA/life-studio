// var path = require("path");
// var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var event = require(path.join(process.cwd(), 'models', 'event'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var events = {};

  if (!__util.isEmptyObject(req.body.form_data)) {
    events = req.body.form_data;
    events = _setEventObj(events);
  }

  if (events.tiles) {
    for (var i = 0; i < events.tiles.length; i++) {
      var tile = events.tiles[i];

      if (tile.triggerdata.type == 'time') {
        events = $general.setAvailableFrom(events, tile._id, $general.stringToDate(tile.triggerdata.timeToActivate));
      } else if (tile.triggerdata.type != 'always' && !__util.isNullOrEmpty(tile.triggerdata.availableFrom) && __util.isNullOrEmpty(tile.triggerdata.deactivatedTime)) {
        events = $general.setAvailableFrom(events, tile._id, $general.stringToDate(tile.triggerdata.availableFrom));
      } else if (tile.triggerdata.type == 'always') {
        tile.triggerdata.availableFrom = events.eventStart;
      }

      if (tile.hasOwnProperty("activityDate") && !__util.isNullOrEmpty(tile.activityDate)) {
        events.tiles[i].activityDate = $general.stringToDate(tile.activityDate);
      }
    }
  }

  if (__util.isNullOrEmpty(events._id)) {
    var tokenObj = $authtoken.get(req.cookies.token);
    events.createdBy = tokenObj.uid;

    $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.event, events, function (result) {
      obj = {};
      obj._id = result;

      _pageEventUpdate(result.toString(), events.eventStart, events.availableEnd, function (data) {
        //$general.returnJSON(context, obj);
        res.send(obj);
      });
    });
  } else {
    options = {};
    query = {};
    query._id = events._id;
    delete events["_id"];

    updateEvent(query, options, events, function (result) {
      obj = {};
      obj._id = query._id;

      _pageEventUpdate(result.toString(), events.eventStart, events.availableEnd, function (data) {
        //$general.returnJSON(context, obj);
        res.send(obj);
      });
    });
  }
};

var _pageEventUpdate = function (eventId, eventStart, availableEnd, cb) {
  query = {
    "menuTiles.linkId": eventId
  };
  options = {
    multi: true
  };
  data = {
    "menuTiles.$.availableOn": new Date(eventStart).toUTCString(),
    "menuTiles.$.endOn": new Date(availableEnd).toUTCString()
  };

  $page._update(query, options, data, function (result) {
    cb(result);
  });
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

var updateEvent = function (eQuery, eOptions, dataToUpdate, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.event, eQuery, eOptions, dataToUpdate, function (result) {
    cb(result);
  });
};

var _getEvent = function (eQuery, callback) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.event, eQuery, options, function (result) {
    callback(result);
  });
};

var activate = function (req, res, next) {
  options = {};
  query = {};
  query._id = req.params.eventId;

  _getEvent(query, function (result) {
    var tile;
    var tileId = req.params.tileId;

    if (result.length > 0) {
      var event = result[0];
      var indx = req.params.position;
      tile = event.tiles[parseInt(indx)];

      console.dir(tile);
      var currentDateTime = new Date();
      // currentDateTime = currentDateTime.setSeconds(0);
      currentDateTime = new Date(currentDateTime);

      var dateTime = new Date();
      dateTime.setTime(currentDateTime.getTime());
      dateTime.setMinutes(dateTime.getMinutes() + 5);
      dateTime = new Date(dateTime.toUTCString());

      if (tile && tileId == tile._id) {
        delete tile.triggerdata["deactivated"];
        delete tile.triggerdata["deactivatedTime"];
        // delete tile.triggerdata["stopType"];
        // delete tile.triggerdata["delayToDeActivate"];
        // delete tile.triggerdata["timeToDeActivate"];

        tile.triggerdata.availableFrom = currentDateTime.toUTCString().toLowerCase();

        if (tile.triggerdata.type == "delay") {
          tile.triggerdata.type = 'manual';
        }

        if (tile.triggerdata.type == "time") {
          var orginalTime = new Date(tile.triggerdata.timeToActivate);

          if (!__util.isNullOrEmpty(tile.triggerdata.timeToActivate) && orginalTime < dateTime) {
            tile.triggerdata.type = 'manual';
            delete tile.triggerdata["time"];
          } else {
            tile.triggerdata.availableFrom = tile.triggerdata.timeToActivate;
          }
        }

        tile = $general._getDeActivateTime(event, tile, currentDateTime, indx);

        event.tiles[parseInt(indx)] = tile;

        var jsonData = JSON.stringify(event);
        var events = JSON.parse(jsonData);
        events = _setEventObj(events);

        $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.event, events, function (evtRes) {
          res.send({});
        });
      } else {
        res.send({ "status": "Not Found" });
      }
    } else {
      res.send({});
    }
  });
};

var deActivate = function (req, res, next) {
  options = {};
  query = {};
  query._id = req.params.eventId;

  _getEvent(query, function (result) {
    var tile;
    var tileId = req.params.tileId;

    if (result.length > 0) {
      var event = result[0];
      var indx = req.params.position;
      tile = event.tiles[parseInt(indx)];

      if (tile && tileId == tile._id) {
        var curDateTime = new Date();
        // curDateTime = curDateTime.setSeconds(0);
        tile.triggerdata.deactivatedTime = (new Date(curDateTime)).toUTCString().toLowerCase();
        tile.triggerdata.deactivated = true;
        event.tiles[parseInt(indx)] = tile;

        var jsonData = JSON.stringify(event);
        var events = JSON.parse(jsonData);
        events = _setEventObj(events);

        $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.event, events, function (evtRes) {
          res.send({});
        });
      } else {
        res.send({ "status": "Not Found" });
      }
    } else {
      res.send({});
    }
  });
};

var _setEventObj = function (events) {
  /*if (!__util.isNullOrEmpty(events.availableStart)) {
    //events.availableStart = $general.stringToDate(events.availableStart);
  }*/

  if (!__util.isNullOrEmpty(events.eventStart)) {
    events.eventStart = $general.stringToDate(events.eventStart);
  }

  if (!__util.isNullOrEmpty(events.availableEnd)) {
    events.availableEnd = $general.stringToDate(events.availableEnd);
  }

  if (!__util.isNullOrEmpty(events.dateCreated)) {
    events.dateCreated = $general.stringToDate(events.dateCreated);
  }

  if (!__util.isNullOrEmpty(events.dateUpdated)) {
    events.dateUpdated = $general.stringToDate(events.dateUpdated);
  }

  return events;
};

var remove = function (req, res, next) {
  query = {};
  options = {};
  var obj = {};
  obj.deleted = false;

  if (!__util.isNullOrEmpty(req.params.eventId)) {
    query._id = req.params.eventId;

    $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.event, query, options, function (result) {
      obj.deleted = result;
      res.send(obj);
    });
  } else {
    res.send(obj);
  }
};

module.exports = {
  "init": init,
  "save": save,
  "eventByTiles": eventByTiles,
  "list": list,
  "get": get,
  "updateEvent": updateEvent,
  "activate": activate,
  "deActivate": deActivate,
  "remove": remove
};
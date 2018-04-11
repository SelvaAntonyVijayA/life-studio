var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var _getNotificationList = function (nQuery, cb) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.notification, nQuery, options, function (result) {
    cb(result);
  });
};

var processSmartEngine = function (engineId, type, appId, remove) {
  var smartEngine = {};
  smartEngine.linkTo = type;
  smartEngine.linkId = engineId;
  var squareToUpdate = [smartEngine];

  $apps.getAppsByIds({}, function (apps) {
    if (!remove) {
      updateNotificationsGroup(squareToUpdate, appId, apps, [], "smart");
    } else {
      var removeGroupSquareObj = assignGroupSquares(squareToUpdate);
      _updateGroupSquares(removeGroupSquareObj.tileIds, removeGroupSquareObj.eventIds, removeGroupSquareObj.catilistIds, removeGroupSquareObj.tilistIds, removeGroupSquareObj.menuIds, removeGroupSquareObj.liveIds, apps, appId, "smart", true);
    }
  });
};

var updateNotificationsGroup = function (notificationSquares, appId, apps, notificationsRemove, engineName) {
  var groupSquareObj = assignGroupSquares(notificationSquares);

  _updateGroupSquares(groupSquareObj.tileIds, groupSquareObj.eventIds, groupSquareObj.catilistIds, groupSquareObj.tilistIds, groupSquareObj.menuIds, groupSquareObj.liveIds, apps, appId, engineName, false);

  if (notificationsRemove.length > 0) {
    var removeGroupSquareObj = assignGroupSquares(notificationsRemove);
    _updateGroupSquares(removeGroupSquareObj.tileIds, removeGroupSquareObj.eventIds, removeGroupSquareObj.catilistIds, removeGroupSquareObj.tilistIds, removeGroupSquareObj.menuIds, groupSquareObj.liveIds, apps, appId, engineName, true);
  }
};

var assignGroupSquares = function (notificationObj) {
  var squareObj = {};
  var tileIds = [];
  var eventIds = [];
  var catilistIds = [];
  var tilistIds = [];
  var liveIds = [];
  var menuIds = [];

  notificationObj.forEach(function (square) {
    if (square.linkTo == "tile") {
      tileIds.push(square.linkId);
    }

    if (square.linkTo == "event") {
      eventIds.push(square.linkId);
    }

    if (square.linkTo == "catilist") {
      catilistIds.push(square.linkId);
    }

    if (square.linkTo == "tilist") {
      tilistIds.push(square.linkId);
    }

    if (square.linkTo == "menu") {
      menuIds.push(square.linkId);
    }

    if (square.linkTo == "livestream") {
      liveIds.push(square.linkId);
    }
  });

  squareObj.tileIds = tileIds;
  squareObj.eventIds = eventIds;
  squareObj.catilistIds = catilistIds;
  squareObj.tilistIds = tilistIds;
  squareObj.menuIds = menuIds;
  squareObj.liveIds = liveIds;

  return squareObj;
};

var _updateGroupSquares = function (tileIds, eventIds, catilistIds, tilistIds, menuIds, liveIds, apps, appId, engineName, remove) {
  apps = $general.convertToJsonObject(apps);

  $async.parallel({
    Tiles: function (callback) {
      var tileQuery = {
        "_id": tileIds
      };

      $tile._getTiles(tileQuery, function (tiles) {
        tiles = $general.convertToJsonObject(tiles);

        tiles.forEach(function (tileObj) {
          _updateNotificationTile(tileObj, appId, apps, engineName, remove);
        });
      });
    },
    Events: function (callback) {
      var eventQuery = {
        "_id": eventIds
      };

      $event._getEvents(eventQuery, function (events) {
        events = $general.convertToJsonObject(events);

        events.forEach(function (eventObj) {
          _updateNotificationEvent(eventObj, appId, apps, engineName, remove);
        });
      });
    },
    Catilists: function (callback) {
      var catilistQuery = {
        "_id": catilistIds
      };

      $catilist._getCatilists(catilistQuery, function (catilists) {
        catilists = $general.convertToJsonObject(catilists);

        catilists.forEach(function (catilistObj) {
          _updateNotificationCatilist(catilistObj, appId, apps, engineName, remove);
        });
      });
    },
    TilistIds: function (callback) {
      var tilistQuery = {
        "_id": tilistIds
      };

      $tilist._getTilists(tilistQuery, function (tilists) {
        tilists = $general.convertToJsonObject(tilists);

        tilists.forEach(function (tilistObj) {
          _updateNotificationtilist(tilistObj, appId, apps, engineName, remove);
        });
      });
    },
    Menus: function (callback) {
      var menuQuery = {
        "_id": menuIds
      };

      $page.getAppMenu(menuQuery, {}, function (pages) {
        pages = $general.convertToJsonObject(pages);

        pages.forEach(function (pageObj) {
          _updateNotificationMenu(pageObj, appId, apps, engineName, remove);
        });
      });
    },
    livestream: function (callback) {
      var liveQuery = {
        "_id": liveIds
      };

      $livestream.get(liveQuery, function (liveStreams) {
        liveStreams = $general.convertToJsonObject(liveStreams);

        liveStreams.forEach(function (pageObj) {
          _updateLiveStream(pageObj, appId, apps, engineName, remove);
        });
      });
    }
  }, function (err, results) {
    if (cb) {
      cb();
    }
  });
};

var _updateNotificationTile = function (tileObj, appId, apps, engineName, remove) {
  var tileData = {
  };

  if ((!__util.isNullOrEmpty(tileObj.notification) && engineName == "notification") || (!__util.isNullOrEmpty(tileObj.smart) && engineName == "smart")) {
    var appExits;

    if (engineName == "notification") {
      appExits = _.filter(tileObj.notification.apps, function (appObj) {
        return appObj._id == appId;
      });
    } else {
      appExits = _.filter(tileObj.smart.apps, function (appObj) {
        return appObj._id == appId;
      });
    }

    if (appExits.length == 0) {
      var appToPush = _getAppData(apps, appId);

      if (engineName == "notification") {
        tileObj.notification.apps.push(appToPush);
        tileData = {
          "notification": tileObj.notification
        };
      } else {
        tileObj.smart.apps.push(appToPush);
        tileData = {
          "smart": tileObj.smart
        };
      }
    } else {
      if (engineName == "notification") {
        if (remove) {
          tileObj.notification.apps = processRemoveApp(tileObj.notification.apps, appId);
        }

        tileData = {
          "notification": tileObj.notification
        };
      } else {
        if (remove) {
          tileObj.smart.apps = processRemoveApp(tileObj.smart.apps, appId);
        }

        tileData = {
          "smart": tileObj.smart
        };
      }
    }
  } else {
    var appToPush = _getAppData(apps, appId);
    var appDataToPush = remove ? [] : [appToPush];

    if (engineName == "notification") {
      tileData = {
        "notification": {
          "apps": appDataToPush
        }
      };
    } else {
      tileData = {
        "smart": {
          "apps": appDataToPush
        }
      };
    }
  }

  var tileQuery = {
    "_id": tileObj._id
  };

  $tile.tileUpdate(tileQuery, {}, tileData, function (result) {

  });
};

var _updateNotificationEvent = function (eventObj, appId, apps, engineName, remove) {
  var eventData = {};

  if ((!__util.isNullOrEmpty(eventObj.notification) && engineName == "notification") || (!__util.isNullOrEmpty(eventObj.smart) && engineName == "smart")) {
    var appExits;

    if (engineName == "notification") {
      appExits = _.filter(eventObj.notification.apps, function (appObj) {
        return appObj._id == appId;
      });
    } else {
      appExits = _.filter(eventObj.smart.apps, function (appObj) {
        return appObj._id == appId;
      });
    }

    if (appExits.length == 0) {
      var appToPush = _getAppData(apps, appId);

      if (engineName == "notification") {
        eventObj.notification.apps.push(appToPush);
        eventData = {
          "notification": eventObj.notification
        };
      } else {
        eventObj.smart.apps.push(appToPush);
        eventData = {
          "smart": eventObj.smart
        };
      }
    } else {

      if (engineName == "notification") {
        if (remove) {
          eventObj.notification.apps = processRemoveApp(eventObj.notification.apps, appId);
        }

        eventData = {
          "notification": eventObj.notification
        };
      } else {
        if (remove) {
          eventObj.smart.apps = processRemoveApp(eventObj.smart.apps, appId);
        }

        eventData = {
          "smart": eventObj.smart
        };
      }
    }
  } else {
    var appToPush = _getAppData(apps, appId);
    var appDataToPush = remove ? [] : [appToPush];

    if (engineName == "notification") {
      eventData = {
        "notification": {
          "apps": appDataToPush
        }
      };
    } else {
      eventData = {
        "smart": {
          "apps": appDataToPush
        }
      };
    }
  }

  var eventQuery = {
    "_id": eventObj._id
  };

  $event.updateEvent(eventQuery, {}, eventData, function (result) {
  });
};

var _updateNotificationCatilist = function (catilistObj, appId, apps, engineName, remove) {
  var catilistData = {
  };

  if ((!__util.isNullOrEmpty(catilistObj.notification) && engineName == "notification") || (!__util.isNullOrEmpty(catilistObj.smart) && engineName == "smart")) {
    var appExits;

    if (engineName == "notification") {
      appExits = _.filter(catilistObj.notification.apps, function (appObj) {
        return appObj._id == appId;
      });
    } else {
      appExits = _.filter(catilistObj.smart.apps, function (appObj) {
        return appObj._id == appId;
      });
    }

    if (appExits.length == 0) {
      var appToPush = _getAppData(apps, appId);

      if (engineName == "notification") {
        catilistObj.notification.apps.push(appToPush);
        catilistData = {
          "notification": catilistObj.notification
        };
      } else {
        catilistObj.smart.apps.push(appToPush);
        catilistData = {
          "smart": catilistObj.smart
        };
      }
    } else {
      if (engineName == "notification") {
        if (remove) {
          catilistObj.notification.apps = processRemoveApp(catilistObj.notification.apps, appId);
        }

        catilistData = {
          "notification": catilistObj.notification
        };
      } else {
        if (remove) {
          catilistObj.smart.apps = processRemoveApp(catilistObj.smart.apps, appId);
        }

        catilistData = {
          "smart": catilistObj.smart
        };
      }
    }
  } else {
    var appToPush = _getAppData(apps, appId);
    var appDataToPush = remove ? [] : [appToPush];

    if (engineName == "notification") {
      catilistData = {
        "notification": {
          "apps": appDataToPush
        }
      };
    } else {
      catilistData = {
        "smart": {
          "apps": appDataToPush
        }
      };
    }
  }

  var catilistQuery = {
    "_id": catilistObj._id
  };

  $catilist.updateCatilist(catilistQuery, {}, catilistData, function (result) {
  });
};

var _updateLiveStream = function (liveStreamObj, appId, apps, engineName, remove) {
  var liveStreamData = {
  };

  if ((!__util.isNullOrEmpty(liveStreamObj.notification) && engineName == "notification") || (!__util.isNullOrEmpty(liveStreamObj.smart) && engineName == "smart")) {
    var appExits;

    if (engineName == "notification") {
      appExits = _.filter(liveStreamObj.notification.apps, function (appObj) {
        return appObj._id == appId;
      });
    } else {
      appExits = _.filter(liveStreamObj.smart.apps, function (appObj) {
        return appObj._id == appId;
      });
    }

    if (appExits.length == 0) {
      var appToPush = _getAppData(apps, appId);

      if (engineName == "notification") {
        liveStreamObj.notification.apps.push(appToPush);
        liveStreamData = {
          "notification": liveStreamObj.notification
        };
      } else {
        liveStreamObj.smart.apps.push(appToPush);
        liveStreamData = {
          "smart": liveStreamObj.smart
        };
      }
    } else {
      if (engineName == "notification") {
        if (remove) {
          liveStreamObj.notification.apps = processRemoveApp(liveStreamObj.notification.apps, appId);
        }

        liveStreamData = {
          "notification": liveStreamObj.notification
        };
      } else {
        if (remove) {
          liveStreamObj.smart.apps = processRemoveApp(liveStreamObj.smart.apps, appId);
        }

        liveStreamData = {
          "smart": liveStreamObj.smart
        };
      }
    }
  } else {
    var appToPush = _getAppData(apps, appId);
    var appDataToPush = remove ? [] : [appToPush];

    if (engineName == "notification") {
      liveStreamData = {
        "notification": {
          "apps": appDataToPush
        }
      };
    } else {
      liveStreamData = {
        "smart": {
          "apps": appDataToPush
        }
      };
    }
  }

  var liveQuery = {
    "_id": liveStreamObj._id
  };

  $livestream.updateLiveStream(liveQuery, {}, liveStreamData, function (result) {
  });
};

var _updateNotificationtilist = function (tilistObj, appId, apps, engineName, remove) {
  var tilistData = {};

  if ((!__util.isNullOrEmpty(tilistObj.notification) && engineName == "notification") || (!__util.isNullOrEmpty(tilistObj.smart) && engineName == "smart")) {
    var appExits;

    if (engineName == "notification") {
      appExits = _.filter(tilistObj.notification.apps, function (appObj) {
        return appObj._id == appId;
      });
    } else {
      appExits = _.filter(tilistObj.smart.apps, function (appObj) {
        return appObj._id == appId;
      });
    }

    if (appExits.length == 0) {
      var appToPush = _getAppData(apps, appId);

      if (engineName == "notification") {
        tilistObj.notification.apps.push(appToPush);
        tilistData = {
          "notification": tilistObj.notification
        };
      } else {
        tilistObj.smart.apps.push(appToPush);
        tilistData = {
          "smart": tilistObj.smart
        };
      }
    } else {
      if (engineName == "notification") {
        if (remove) {
          tilistObj.notification.apps = processRemoveApp(tilistObj.notification.apps, appId);
        }

        tilistData = {
          "notification": tilistObj.notification
        };
      } else {
        if (remove) {
          tilistObj.smart.apps = processRemoveApp(tilistObj.smart.apps, appId);
        }

        tilistData = {
          "smart": tilistObj.smart
        };
      }
    }
  } else {
    var appToPush = _getAppData(apps, appId);
    var appDataToPush = remove ? [] : [appToPush];

    if (engineName == "notification") {
      tilistData = {
        "notification": {
          "apps": appDataToPush
        }
      };
    } else {
      tilistData = {
        "smart": {
          "apps": appDataToPush
        }
      };
    }
  }

  var tilistQuery = {
    "_id": tilistObj._id
  };

  $tilist.updateTilist(tilistQuery, {}, tilistData, function (result) {
  });
};

var _updateNotificationMenu = function (menuObj, appId, apps, engineName, remove) {
  var menuData = {};

  if ((!__util.isNullOrEmpty(menuObj.notification) && engineName == "notification") || (!__util.isNullOrEmpty(menuObj.smart) && engineName == "smart")) {
    var appExits;

    if (engineName == "notification") {
      appExits = _.filter(menuObj.notification.apps, function (appObj) {
        return appObj._id == appId;
      });
    } else {
      appExits = _.filter(menuObj.smart.apps, function (appObj) {
        return appObj._id == appId;
      });
    }

    if (appExits.length == 0) {
      var appToPush = _getAppData(apps, appId);

      if (engineName == "notification") {
        menuObj.notification.apps.push(appToPush);
        menuData = {
          "notification": menuObj.notification
        };
      } else {
        menuObj.smart.apps.push(appToPush);
        menuData = {
          "smart": menuObj.smart
        };
      }
    } else {
      if (engineName == "notification") {
        if (remove) {
          menuObj.notification.apps = processRemoveApp(menuObj.notification.apps, appId);
        }

        menuData = {
          "notification": menuObj.notification
        };
      } else {
        if (remove) {
          menuObj.smart.apps = processRemoveApp(menuObj.smart.apps, appId);
        }

        menuData = {
          "smart": menuObj.smart
        };
      }
    }
  } else {
    var appToPush = _getAppData(apps, appId);
    var appDataToPush = remove ? [] : [appToPush];

    if (engineName == "notification") {
      menuData = {
        "notification": {
          "apps": appDataToPush
        }
      };
    } else {
      menuData = {
        "smart": {
          "apps": appDataToPush
        }
      };
    }
  }

  var menuQuery = {
    "_id": menuObj._id
  };

  $page._update(menuQuery, {}, menuData, function (result) {
  });
};

var _getAppData = function (apps, appId) {
  var currentApp = _.filter(apps, function (appObj) {
    return appObj._id == appId;
  });

  var appData = {
    "_id": currentApp[0]._id,
    "name": currentApp[0].name
  };

  return appData;
};

var processRemoveApp = function (apps, appId) {
  _.each(apps, function (data, index) {
    if (data && data._id == appId) {
      apps.splice(index, 1);

      return;
    }
  });

  return apps;
};

module.exports = {
  "init": init,
  "_getNotificationList": _getNotificationList,
  "processSmartEngine": processSmartEngine
};
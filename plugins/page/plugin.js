//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var pages = req.body.form_data;
  var tokenObj = $authtoken.get(req.cookies.token);
  pages = _setPageObj(pages);

  $async.waterfall([
    function (callback) {
      options = {};

      if (__util.isNullOrEmpty(pages._id)) {
        callback(null, []);
      } else {
        query = {};
        query._id = pages._id;

        getAppMenu(query, options, function (pageObj) {
          callback(null, pageObj);
        });
      }
    },
    function (pageObj, callback) {
      _getAppUpdateSquares(pages, pageObj, function (datasPush, datasPull) {
        callback(null, datasPush, datasPull);
      });
    },
    function (datasPush, datasPull, callback) {
      _updateAppsIds(datasPush, datasPull, function () {
        callback(null);
      });
    }], function (err) {
      if (__util.isNullOrEmpty(pages._id)) {
        pages["createdBy"] = tokenObj.uid;

        $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.page, pages, function (result) {
          var saveResult = { "_id": result };
          res.send(saveResult);
        });
      } else {
        options = {};
        var uQuery = {};
        uQuery._id = pages._id;
        delete pages["_id"];

        pages["updatedBy"] = tokenObj.uid;

        _update(uQuery, options, pages, function (result) {
          var updateResult = { "_id": uQuery._id };
          res.send(updateResult);
        });
      }
    });
};

var update = function (req, res, next) {
  position = {};
  query = {};
  options = {};

  if (__util.isNullOrEmpty(req.params.menuId)) {
    var pagePosition = req.body.form_data;

    $async.each(pagePosition, function (pPosion, loop) {
      query._id = pPosion.pageId;
      position = { position: pPosion.position };

      _update(query, options, position, function (result) {
        loop();
      });

    }, function () {
      res.send({});
    });

  } else {
    query._id = req.params.menuId;
    position = req.body.form_data;

    var tokenObj = $authtoken.get(req.cookies.token);
    position.updatedBy = tokenObj.uid;

    _update(query, options, position, function (result) {
      var updateResult = { "_id": req.params.menuId };
      res.send(updateResult);
    });
  }
};

var list = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      if (!__util.isNullOrEmpty(req.params.orgId) && !__util.isNullOrEmpty(req.params.appId)) {
        query = {};
        options = {};
        options.sort = [['position', 'asc']];

        if (req.body.hasOwnProperty("form_data") && req.body["form_data"].hasOwnProperty("_id")) {
          query._id = req.body["form_data"]["_id"];
        }

        query.orgId = req.params.orgId;
        query.appId = req.params.appId;
        query.deleted = {
          $exists: false
        };

        if (!__util.isNullOrEmpty(req.params.locationId) && req.params.locationId !== "-1") {
          query.locationId = req.params.locationId;
        }

        $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.page, query, options, function (pages) {
          callback(null, pages);
        });
      } else {
        callback(null, []);
      }
    },
    function (pages, callback) {
      var groups = [];
      var language = "en";

      if (!__util.isNullOrEmpty(req.params.language)) {
        language = req.params.language.replace("__", "");
      }

      if (pages.length > 0) {
        _.each(pages, function (page) {

          if (language !== "en" && page.hasOwnProperty(language)) {
            page.title = page[language].title;
            page.menuTiles = page[language].menuTiles;
          }

          if (page.hasOwnProperty("menuTiles") && !__util.isEmptyObject(page.menuTiles) && page.menuTiles.length > 0) {
            var squares = _.filter(page.menuTiles, function (square) {
              return !__util.isNullOrEmpty(square.isPrivate) && square.isPrivate == true && square.linkTo == 'menu';
            });

            groups = groups.concat(squares);
          }
        });
      }

      callback(null, pages, groups);
    },
    function (pages, groups, callback) {
      pages.forEach(function (page) {
        var id = JSON.stringify(page._id);
        id = JSON.parse(id);

        var isRole = _.findWhere(groups, {
          "linkTo": "menu",
          "linkId": id
        });

        if (isRole) {
          page.isRoleBased = true;
        } else {
          page.isRoleBased = false;
        }
      });

      callback(null, pages);
    }], function (err, pages) {
      if (__util.isNullOrEmpty(req.params.orgId) || __util.isNullOrEmpty(req.params.appId)) {
        res.status(404).send('404 Page Not Found.');
      } else {
        res.send(pages);
      }
    });
};

var isRoleGroup = function (query, options, group, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.page, query, options, function (pages) {
    var groups = [];

    if (pages.length > 0) {
      _.each(pages, function (page) {
        if (!__util.isEmptyObject(page.menuTiles) && page.menuTiles.length > 0) {

          var squares = _.filter(page.menuTiles, function (square) {
            return !__util.isNullOrEmpty(square.isPrivate) && square.isPrivate == true && square.linkTo == group;
          });

          groups = groups.concat(squares);
        }
      });
    }

    cb(groups);
  });
};

var _update = function (pQuery, pOptions, data, cb) {
  data = _setPageObj(data);

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.page, pQuery, pOptions, data, function (result) {
    cb(result);
  });
};

var _setPageObj = function (pages) {
  if (!__util.isNullOrEmpty(pages.dateCreated)) {
    pages.dateCreated = $general.stringToDate(pages.dateCreated);
  }

  if (!__util.isNullOrEmpty(pages.dateUpdated)) {
    pages.dateUpdated = $general.stringToDate(pages.dateUpdated);
  }

  return pages;
};

var getPageTiles = function (req, res, next) {
  var tQuery = { "_id": req.body.tileIds };
  options = {};

  var tileFields = {
    "_id": 1, "title": 1, "art": 1, "notification": 1,
    "smart": 1,
    "Apps": 1,
    "Procedure": 1,
    "hsrRuleEngine": 1,
    "isWeight": 1,
    "isRoleBased": 1
  };

  if (req.body.tileIds.length > 0) {
    $tile.getSpecificFields(tileFields, tQuery, options, function (tiles) {
      res.send(tiles);
    });
  } else {
    res.send([]);
  }
};

var getAppMenu = function (pQuery, pOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.page, pQuery, pOptions, function (result) {
    cb(result);
  });
};

var _getAppUpdateSquares = function (newDatas, oldDatas, cb) {
  var oldsquares = oldDatas && oldDatas.length > 0 && !__util.isEmptyObject(oldDatas[0].menuTiles) ? oldDatas[0].menuTiles : [];
  var newSquares = newDatas && !__util.isEmptyObject(newDatas.menuTiles) ? newDatas.menuTiles : [];
  var pageData = !__util.isEmptyObject(newDatas) ? newDatas : {};
  var pushDatas = [];
  var pullDatas = [];

  _.each(newSquares, function (square) {
    var data = {};
    data._id = square.linkId;
    data.type = square.linkTo;

    var app = {};
    app.appId = pageData.appId;
    app.appName = pageData.appName;

    data.app = app;

    var squareExists = _.findWhere(pushDatas, {
      "_id": square.linkId,
      "type": square.linkTo
    });

    if (!squareExists) {
      pushDatas.push(data);
    }
  });

  _.each(oldsquares, function (square) {
    var isSquare = _.findWhere(newSquares, {
      "linkTo": square.linkTo,
      "linkId": square.linkId
    });

    var data = {};
    data._id = square.linkId;
    data.type = square.linkTo;

    var app = {};
    app.appId = pageData.appId;
    app.appName = pageData.appName;

    data.app = app;

    var squareExists = _.findWhere(pullDatas, {
      "_id": square.linkId,
      "type": square.linkTo
    });

    if (!squareExists && !isSquare) {
      pullDatas.push(data);
    }
  });

  cb(pushDatas, pullDatas);
};

var _updateAppsIds = function (pushApps, pullApps, cb) {
  $async.parallel({
    push: function (callback) {
      $async.each(pushApps, function (square, cbpush) {
        var dataToUpdate = {};
        dataToUpdate.Apps = square.app;

        var data = {
          $addToSet: dataToUpdate
        };

        var query = {};
        query._id = square._id;

        _updateApps(square.type, query, data, function () {
          cbpush();
        });

      }, function () {
        callback(null);
      });
    },
    pull: function (callback) {
      $async.each(pullApps, function (square, cbpull) {
        var dataToUpdate = {};
        dataToUpdate.Apps = square.app;

        var data = {
          $pull: dataToUpdate
        };

        var query = {};
        query._id = square._id;

        _updateApps(square.type, query, data, function () {
          cbpull();
        });
      }, function () {
        callback(null);
      });
    }
  }, function (err, results) {
    if (cb) {
      cb();
    }
  });
};

var _updateApps = function (type, uQuery, data, cb) {
  switch (type) {
    case "tile":
      $tile.tileUpdate(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
    case "event":
      $event.updateEvent(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
    case "catilist":
      $catilist.updateCatilist(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
    case "tilist":
      $tilist.updateTilist(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
    case "menu":
      _update(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
    case "livestream":
      $livestream.updateLiveStream(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
    case "procedure":
      $procedure.updateProcedure(uQuery, {}, data, function (result) {
        if (cb) {
          cb();
        }
      });
      break;
  }
};

var pageStreamUpdate = function (req, res, next) {
  var streamObj = req.body.form_data;

  $async.waterfall([
    function (callback) {
      var liveStreamQuery = {
        "_id": streamObj.streamId
      };

      $livestream.get(liveStreamQuery, function (stream) {
        if (stream && stream.length > 0) {
          callback(null, stream);

        } else {
          callback(null, []);
        }
      });

    }], function (err, stream) {
      if (stream && stream.length > 0) {
        var streamQuery = {
          "appId": stream[0].createdApp.id,
          "menuTiles": {
            "$elemMatch": {
              "linkTo": "livestream",
              "linkId": streamObj.streamId
            }
          }
        };

        var streamToUpdate = {
          "menuTiles.$.imageUrl": streamObj.url
        };

        options = {
          "multi": true
        };

        _update(streamQuery, options, streamToUpdate, function (result) {
          res.send(result);
        });

      } else {
        res.send({ "update": true });
      }
    });
};

var remove = function (req, res, next) {
  query = {};
  query._id = req.params.menuId;

  var data = {
    deleted: true,
    dateUpdated: (new Date((new Date()).toUTCString()))
  };

  _update(query, {}, data, function (result) {
    var delResult = { "deleted": result };
    res.send(delResult);
  });
};

var pageThemeSave = function (req, res, next) {
  var tokenObj = $authtoken.get(req.cookies.token);
  var obj = req.body.form_data;
  obj.createdBy = tokenObj.uid;

  obj = $general.getObjectIdByQuery(obj);

  $async.waterfall([
    function (callback) {
      query = {};
      if (!__util.isNullOrEmpty(obj.appId)) {
        query.appId = obj.appId;
      }

      if (!__util.isNullOrEmpty(obj.locationId)) {
        query.locationId = obj.locationId;
      }

      query = $general.getObjectIdByQuery(query);

      $page.getPageTheme(query, options, function (res) {
        callback(null, res)
      });
    },
  ], function (err, theme) {
    if (theme.length == 0) {
      obj.createdOn = $general.getIsoDate();

      $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.pagetheme, obj, function (result) {
        var resObj = { "_id": result };

        res.send(resObj);
      });
    } else {
      options = {};
      var updateQuery = {};
      updateQuery._id = theme[0]._id;
      delete obj["_id"];
      obj.lastUpdatedOn = $general.getIsoDate();

      $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.pagetheme, updateQuery, options, obj, function (result) {
        var resObj = { "_id": updateQuery._id };

        res.send(resObj);
      });
    }
  });
};

var pageThemeUpdate = function (req, res, next) {
  var obj = req.body.form_data;
  obj = $general.getObjectIdByQuery(obj);

  options = {};
  var updateQuery = {};
  updateQuery._id = req.params.themeId;

  delete obj["_id"];
  obj.lastUpdatedOn = $general.getIsoDate();

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.pagetheme, updateQuery, options, obj, function (result) {
    var resultObj = { "_id": updateQuery._id };

    res.send(resultObj);
  });
};

var pageThemeList = function (req, res, next) {
  query = {};

  if (!__util.isNullOrEmpty(req.params.appId)) {
    query.appId = req.params.appId;
  }

  if (!__util.isNullOrEmpty(req.params.locationId)) {
    query.locationId = req.params.locationId;
  }

  query = $general.getObjectIdByQuery(query);
  options = {};

  $page.getPageTheme(query, options, function (themeResult) {
    res.send(themeResult);
  });
};

var getPageTheme = function (tQuery, tOptions, cb) {

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.pagetheme, tQuery, tOptions, function (result) {
    cb(result);
  });
};

var squares = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      var options = {};
      options.sort = [['position', 'asc']];

      query = {};
      query.orgId = req.params.orgId;
      query.appId = req.params.appId;
      query.deleted = {
        $exists: false
      };

      if (!__util.isNullOrEmpty(req.params.locationId)) {
        query.locationId = req.params.locationId;
      }

      _pageGroups(query, options, function (datas) {
        callback(null, datas);
      });
    },

    function (datas, callback) {
      query = {};
      query.appId = req.params.appId;

      if (!__util.isNullOrEmpty(req.params.locationId)) {
        query.locationId = req.params.locationId;
      }

      $notification._getNotificationList(query, function (notifications) {
        callback(null, datas, notifications);
      });
    },

    function (datas, notifications, callback) {
      _groupDatas(datas, function (squareDatas) {
        squareDatas.notifications = notifications;
        callback(null, datas, squareDatas);
      });
    }], function (err, datas, squareDatas) {
      query = {};
      query.orgId = req.params.orgId;
      query.appId = req.params.appId;
      query.engineId = {};
      var all = JSON.stringify(datas.allIds);
      var ids = JSON.parse(all);

      query.engineId.$in = ids;
      query.type = {};
      query.type.$in = ['menu', 'event', 'tilist', 'catilist', 'livestream'];
      options = {};

      $smartengine._get(query, options, function (smartTiles) {
        squareDatas.smart = smartTiles;
        var menus = datas.menu;

        menus.forEach(function (menu) {
          var id = JSON.stringify(menu._id);
          id = JSON.parse(id);

          var isRole = _.findWhere(datas.list, {
            "linkTo": "menu",
            "linkId": id,
            "isPrivate": true
          });

          if (isRole) {
            menu.isRoleBased = true;
          } else {
            menu.isRoleBased = false;
          }
        });

        squareDatas.menu = menus;

        res.send(squareDatas);
      });
    });
};

var _pageGroups = function (pQuery, pOptions, cb) {
  var datas = {};

  $async.waterfall([
    function (callback) {
      $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.page, pQuery, pOptions, function (pages) {
        callback(null, pages);
      });
    },
    function (pages, callback) {
      _getPageSquareIds(pages, function (allIds) {
        datas = allIds;

        callback(null);
      });
    }], function (err) {
      cb(datas);
    });
};

var _getPageSquareIds = function (pages, cb) {
  var list = [];
  var datas = {};
  datas.tileIds = [];
  datas.eventIds = [];
  datas.tilistIds = [];
  datas.catilistIds = [];
  datas.procedureIds = [];
  datas.liveIds = [];
  datas.allIds = [];
  datas.pages = [];

  _.each(pages, function (menu) {
    datas.allIds.push(menu._id);

    _.find(menu.menuTiles, function (square, index) {
      if (square.linkTo && square.linkTo.toLowerCase() != 'menu') {
        datas.allIds.push(square.linkId);
      }

      if (square.linkTo && square.linkTo.toLowerCase() == 'tile') {
        datas.tileIds.push(square.linkId);
      } else if (square.linkTo && square.linkTo.toLowerCase() == 'event') {
        datas.eventIds.push(square.linkId);
      } else if (square.linkTo && square.linkTo.toLowerCase() == 'tilist') {
        datas.tilistIds.push(square.linkId);
      } else if (square.linkTo && square.linkTo.toLowerCase() == 'catilist') {
        datas.catilistIds.push(square.linkId);
      } else if (square.linkTo && square.linkTo.toLowerCase() == 'livestream') {
        datas.liveIds.push(square.linkId);
      } else if (square.linkTo && square.linkTo.toLowerCase() == 'procedure') {
        datas.procedureIds.push(square.linkId);
      }

      list.push(square);
    });
  });

  datas.menu = pages;
  datas.list = list;

  cb(datas);
};

var _groupDatas = function (datas, cb) {
  var eventIds = datas.eventIds, tilistIds = datas.tilistIds, catilistIds = datas.catilistIds, liveIds = datas.liveIds, squares = datas.list;
  var data = {};
  $async.parallel([
    function (callback) {
      query = {};
      query._id = eventIds;

      $event._getEvents(query, function (events) {
        events.forEach(function (event) {
          var id = JSON.stringify(event._id);
          id = JSON.parse(id);

          var isRole = _.findWhere(squares, {
            "linkTo": "event",
            "linkId": id,
            "isPrivate": true
          });

          if (isRole) {
            event.isRoleBased = true;
          } else {
            event.isRoleBased = false;
          }
        });

        data.event = events;
        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = tilistIds;

      $tilist._getTilists(query, function (tilists) {
        tilists.forEach(function (tilist) {
          var id = JSON.stringify(tilist._id);
          id = JSON.parse(id);

          var isRole = _.findWhere(squares, {
            "linkTo": "tilist",
            "linkId": id,
            "isPrivate": true
          });

          if (isRole) {
            tilist.isRoleBased = true;
          } else {
            tilist.isRoleBased = false;
          }
        });

        data.tilist = tilists;
        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = catilistIds;

      $catilist._getCatilists(query, function (catilists) {
        catilists.forEach(function (catilist) {
          var id = JSON.stringify(catilist._id);
          id = JSON.parse(id);

          var isRole = _.findWhere(squares, {
            "linkTo": "catilist",
            "linkId": id,
            "isPrivate": true
          });

          if (isRole) {
            catilist.isRoleBased = true;
          } else {
            catilist.isRoleBased = false;
          }
        });

        data.catilist = catilists;
        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = liveIds;

      $livestream.get(query, function (livestreams) {
        livestreams.forEach(function (live) {
          var id = JSON.stringify(live._id);
          id = JSON.parse(id);

          var isRole = _.findWhere(squares, {
            "linkTo": "livestream",
            "linkId": id,
            "isPrivate": true
          });

          if (isRole) {
            live.isRoleBased = true;
          } else {
            live.isRoleBased = false;
          }
        });

        data.livestream = livestreams;
        callback(null);
      });
    }], function (err) {
      cb(data);
    });
};

var tile = function (req, res, next) {
  query = {};

  $async.waterfall([
    function (callback) {
      var options = {};
      options.sort = [['position', 'asc']];

      query = {};
      query.orgId = req.params.orgId;
      query.appId = req.params.appId;
      query.deleted = {
        $exists: false
      };

      if (!__util.isNullOrEmpty(req.params.locationId)) {
        query.locationId = req.params.locationId;
      }

      _pageGroups(query, options, function (datas) {
        callback(null, datas);
      });
    },
    function (datas, callback) {
      _groups(datas, function (squareTileIds) {
        var allTilesIds = datas.tileIds.concat(squareTileIds);
        callback(null, datas, allTilesIds);
      });
    },
    function (datas, allTilesIds, callback) {
      query = {};
      query._id = allTilesIds;

      $tile._getTiles(query, function (tileDatas) {
        callback(null, datas, allTilesIds, tileDatas);
      });
    }], function (err, datas, tileIds, tileDatas) {
      query = {};
      query.orgId = req.params.orgId;
      query.appId = req.params.appId;
      query.engineId = {};
      query.engineId.$in = tileIds;
      query.type = "tile";
      options = {};

      $smartengine._get(query, options, function (smartTiles) {
        var result = {};
        var menus = datas.menu;

        tileDatas.forEach(function (tile) {
          var id = JSON.stringify(tile._id);
          id = JSON.parse(id);

          var isRole = _.findWhere(datas.list, {
            "linkTo": "tile",
            "linkId": id,
            "isPrivate": true
          });

          if (isRole) {
            tile.isRoleBased = true;
          } else {
            tile.isRoleBased = false;
          }
        });

        result.smart = smartTiles;
        result.tiles = tileDatas;

        res.send(result);
      });
    });
};

var _groups = function (datas, cb) {
  var tileIds = [];
  var eventIds = datas.eventIds, tilistIds = datas.tilistIds, catilistIds = datas.catilistIds, liveIds = datas.liveIds, procedureIds = datas.procedureIds;

  $async.parallel([
    function (callback) {
      query = {};
      query._id = eventIds;

      $event._getEvents(query, function (events) {
        _.each(events, function (event) {
          _.find(event.tiles, function (tile, index) {
            tileIds.push(tile._id);
          });
        });

        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = tilistIds;

      $tilist._getTilists(query, function (tilists) {
        _.each(tilists, function (tilist) {
          _.find(tilist.tiles, function (tile, index) {
            tileIds.push(tile._id);
          });
        });

        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = catilistIds;

      $catilist._getCatilists(query, function (catilists) {
        _.each(catilists, function (catilist) {
          _.find(catilist.tiles, function (tile, index) {
            tileIds.push(tile._id);
          });
        });

        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = procedureIds;

      $procedure._getProcedure(query, {}, function (procedures) {
        _.each(procedures, function (procedure) {
          _.find(procedure.tiles, function (tile, index) {
            tileIds.push(tile._id);
          });
        });

        callback(null);
      });
    },
    function (callback) {
      query = {};
      query._id = liveIds;

      $livestream.get(query, function (liveSteams) {
        _.each(liveSteams, function (livestream) {
          _.find(livestream.streamSquare, function (square, index) {
            if (square.type == 'tile') {
              tileIds.push(square.id);
            }
          });
        });

        callback(null);
      });
    }], function (err) {
      cb(tileIds);
    });
};

var questionnaires = function (req, res, next) {
  query = {};

  $async.waterfall([
    function (callback) {
      var options = {};
      options.sort = [['position', 'asc']];

      query = {};
      query.orgId = req.params.orgId;
      query.appId = req.params.appId;
      query.deleted = {
        $exists: false
      };

      if (!__util.isNullOrEmpty(req.params.locationId)) {
        query.locationId = req.params.locationId;
      }

      _pageGroups(query, options, function (datas) {
        callback(null, datas);
      });
    },
    function (datas, callback) {
      _groups(datas, function (groupIds) {
        var allTilesIds = datas.tileIds.concat(groupIds);
        callback(null, allTilesIds);
      });
    },
    function (allTilesIds, callback) {
      query = {};
      query._id = allTilesIds;

      $tile._getSquares(query, 'content', "survey", function (tileDatas) {
        callback(null, tileDatas);
      });
    }], function (err, tileDatas) {
      res.send(tileDatas);
    });
};

var smartUpdate = function (obj, cb) {
  query = {};
  options = {};

  query = {
    "menuTiles.linkId": obj.engineId,
    "menuTiles.linkTo": obj.type
  };

  query.appId = obj.appId;

  var data = {
    dateUpdated: (new Date((new Date()).toUTCString()))
  };

  options.multi = true;

  _update(query, options, data, function (result) {
    if (cb) {
      cb(result);
    }
  });
};

var getAllTileIdsAssignedToApp = function (organizationId, cb) {
  query = {};
  var tilesIdsByApp;

  $async.waterfall([
    function (callback) {
      var options = {};
      options.sort = [['position', 'asc']];

      query = {};
      query.orgId = organizationId;
      query.deleted = {
        $exists: false
      };

      $page.getAppMenu(query, options, function (pages) {
        callback(null, pages);
      });
    },
    function (pages, callback) {
      var groupbyAppId = _.groupBy(pages, 'appId');
      var appKeys = _.keys(groupbyAppId);
      var appSquareIds = [];

      $async.each(appKeys, function (key, loop) {
        var appPages = groupbyAppId[key];

        _getPageSquareIds(appPages, function (allIds) {
          appSquareIds[key] = allIds;

          loop();
        });

      }, function () {
        callback(null, appKeys, appSquareIds);
      });

    },
    function (appKeys, appSquareDatas, callback) {
      var appTileSquareIds = {};

      $async.each(appKeys, function (key, loop) {
        var datas = appSquareDatas[key];

        _groups(datas, function (squareTileIds) {
          var allTilesIds = datas.tileIds.concat(squareTileIds);
          appTileSquareIds[key] = allTilesIds;

          loop();
        });

      }, function () {
        callback(null, appTileSquareIds);
      });

    }], function (err, allTilesIds) {
      cb(allTilesIds);
    });
};


module.exports = {
  "init": init,
  "save": save,
  "update": update,
  "list": list,
  "isRoleGroup": isRoleGroup,
  "getPageTiles": getPageTiles,
  "getAppMenu": getAppMenu,
  "_update": _update,
  "pageStreamUpdate": pageStreamUpdate,
  "pageThemeSave": pageThemeSave,
  "pageThemeUpdate": pageThemeUpdate,
  "pageThemeList": pageThemeList,
  "getPageTheme": getPageTheme,
  "remove": remove,
  "squares": squares,
  "tile": tile,
  "questionnaires": questionnaires,
  "smartUpdate": smartUpdate,
  "getAllTileIdsAssignedToApp": getAllTileIdsAssignedToApp
};

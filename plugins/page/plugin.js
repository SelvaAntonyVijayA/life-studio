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
    var delResult = {"deleted": result};
    res.send(delResult);
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
  "remove": remove
};

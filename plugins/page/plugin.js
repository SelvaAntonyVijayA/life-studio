//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
};

var list = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      if (!__util.isNullOrEmpty(req.params.orgId) && !__util.isNullOrEmpty(req.params.appId)) {
        query = {};
        options = {};
        options.sort = [['position', 'asc']];

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

          if (!__util.isEmptyObject(page.menuTiles) && page.menuTiles.length > 0) {
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

module.exports = {
  "init": init,
  "list": list,
  "isRoleGroup": isRoleGroup,
  "_update": _update
};

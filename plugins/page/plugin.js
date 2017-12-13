//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var page = require(path.join(process.cwd(), 'models', 'page'));

var init = function (app) {
  settingsConf = app.get('settings');
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
  "isRoleGroup": isRoleGroup,
  "_update": _update
};

var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  var obj = JSON.parse(req.body.form_data);
  query = {};
  options = {};

  $db.save(settingsConf.dbname.tilist_users, settingsConf.collections.approles, obj, function (result) {
    var appRoleResult = { "_id": result };

    res.send(appRoleResult);
  });
};

var list = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.params.appId)) {
    query.appId = req.params.appId;
  }

  if (!__util.isNullOrEmpty(req.params.isManager)) {
    query["isManager"] = req.params.isManager == 'true' ? true : false;
  }

  $db.select(settingsConf.dbname.tilist_users, settingsConf.collections.approles, query, options, function (result) {
    if (result.length > 0) {
      result = _processAppRolesList(result);
    }

    res.send(result);
  });
};

var _processAppRolesList = function (appRoles) {
  var squares = [];

  _.each(appRoles, function (role) {
    squares = [];
    if (role.squares && role.squares.length > 0) {
      _.each(role.squares, function (square) {
        var squareIdType = square.squareId + "_" + square.type;
        squares.push(squareIdType);
      });

      role.squares = squares;
    }
  });

  return appRoles;
};

var update = function (req, res, next) {
  query = {};
  options = {};
  var appRoles = {};
  query._id = req.params.appRoleId;
  var pageIds = [];

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    appRoles = req.body.form_data;
  }

  if (appRoles && appRoles.pageIds && appRoles.pageIds.length > 0) {
    pageIds = appRoles.pageIds;
    delete appRoles["pageIds"];
  }

  $db.update(settingsConf.dbname.tilist_users, settingsConf.collections.approles, query, options, appRoles, function (result) {
    var permissions = { "_id": result };

    if (pageIds && pageIds.length > 0) {
      pageDateUpdate(pageIds);
    }

    res.send(permissions);
  });
};

var pageDateUpdate = function (pageIds) {
  _.each(pageIds, function (id) {
    var pageUpdateQuery = {
      "_id": id
    };

    $pagepermissions.updatePageDate(pageUpdateQuery);
  });
};

var removeRole = function (req, res, next) {
  query = {};
  options = {};
  query._id = req.params.appRoleId;

  $db.remove(settingsConf.dbname.tilist_users, settingsConf.collections.approles, query, options, function (result) {
    var removeResult = { "deleted": result };

    res.send(removeResult);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "update": update,
  "removeRole": removeRole
};
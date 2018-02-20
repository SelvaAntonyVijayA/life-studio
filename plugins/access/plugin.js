'use strict';
var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  let obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.access, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  let query = {};

  if (!__util.isNullOrEmpty(req.params.type)) {
    query.type = req.params.type;
  }

  _getAccess(query, function (accesses) {
    res.send(accesses);
  });
};

var userAccesses = function (req, res, next) {
  let query = {};
  let options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.access, query, options, function (result) {
    var list = [];
    if (result.length > 0) {
      _.each(result, function (access) {
        _.each(access.userIds, function (userId) {
          if (context.data.userId == userId) {
            list.push(access);
          }
        });
      });

      res.send(list);
    }
  });
};

var update = function (req, res, next) {
  let query = {};
  let options = {};
  let usersIds = {};
  usersIds = req.body.form_data;
  query._id = req.params.id;

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.access, query, options, usersIds, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  let query = {};
  query._id = req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.access, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var _getAccess = function (queryGet, cb) {
  let options = {};
  options.sort = [['rank', 'asc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.access, queryGet, options, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "remove": remove,
  "update": update,
  "userAccesses": userAccesses
};

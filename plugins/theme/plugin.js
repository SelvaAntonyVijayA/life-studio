'use strict';

var config;
var query = {};
var options = {};

var init = function (app) {
  config = app.get('settings');
};

var save = function (req, res, next) {
  var obj = req.body.form_data;
  query = {};
  options = {};
  var tokenObj = $authtoken.get(req.cookies.token);

  if (__util.isNullOrEmpty(obj._id)) {
    obj["createdBy"] = tokenObj.uid;
    obj["lastUpdatedBy"] = tokenObj.uid;

    $db.save(config.dbname.tilist_core, config.collections.tiletheme, obj, function (result) {
      obj = {};
      obj._id = result;

      res.send(obj);
    });
  } else {
    options = {};
    query = {};
    query._id = obj._id;
    delete obj["_id"];

    obj["lastUpdatedBy"] = tokenObj.uid;

    themeUpdate(query, options, obj, function (result) {
      obj = {};
      obj._id = query._id;

      res.send(obj);
    });
  }
};

var themeUpdate = function (query, options, obj, cb) {
  $db.update(config.dbname.tilist_core, config.collections.tiletheme, query, options, obj, function (result) {
    cb(result);
  });
};

var get = function (req, res, next) {
  query = {};

  if (!__util.isNullOrEmpty(req.params.id)) {
    query._id = req.params.id;

  } else {
    res.send('Not found');
    return;
  }

  getTheme(query, function (result) {
    if (result && result.length > 0) {
      var returnData = {
        _id: result[0]._id
      };

      if (!__util.isNullOrEmpty(result[0].name)) {
        returnData.name = result[0].name;
      }

      if (!__util.isNullOrEmpty(result[0].features)) {
        returnData.features = result[0].features;
      }

      res.send(returnData);
    } else {
      res.send('Not found');
      return;
    }
  });
};

var list = function (req, res, next) {
  var query = {};
  var obj = {};

  if (!__util.isNullOrEmpty(req.params.userId)) {
    query._id = req.params.id;
  }

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    query = req.body.form_data;
  }

  if (__util.isNullOrEmpty(query._id)) {
    var role = {
      organizationId: {
        $exists: false
      },
      role: 'iliadmin'
    };

    obj.$or = [query, role];
  } else {
    obj = query;
  }

  getTheme(obj, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  var obj = {};
  
  $async.waterfall([
    function (callback) {
      var tileQuery = {};
      tileQuery.template = req.params.id;

      $tile._getTiles(tileQuery, function (tiles) {
        callback(null, tiles);
      });
    }], function (err, tiles) {
      if (tiles.length > 0) {
        obj = {};
        obj.deleted = false;
        obj.msg = 'exists';

        res.send(obj);

      } else {
        query = {};
        options = {};
        query._id = req.params.id;

        $db.remove(config.dbname.tilist_core, config.collections.tiletheme, query, options, function (result) {
          obj = {};
          obj.deleted = result;

          res.send(obj);
        });
      }
    });
};

var getTheme = function (query, cb) {
  options = {};

  $db.select(config.dbname.tilist_core, config.collections.tiletheme, query, options, function (result) {
    cb(result);
  });
};

var tilePreviewUpdate = function (req, res, next) {
  var obj = req.body.form_data;
  var curDateTime = new Date();
  var currentDate = new Date(curDateTime).toUTCString();
  var dateTime = new Date(currentDate);

  obj.lastUpdatedOn = dateTime;
  options = {};
  query._id = req.params.id;

  $tile.tileUpdate(query, options, obj, function (result) {
    var tile = {};
    tile._id = query._id;

    res.send(tile);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "get": get,
  "list": list,
  "remove": remove,
  "tilePreviewUpdate": tilePreviewUpdate,
  "themeUpdate": themeUpdate
};
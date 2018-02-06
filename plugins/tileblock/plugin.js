//var path = require("path");
//var mongoose = require('mongoose');
var settingsConf;
var options = {};
var query = {};

//var tileBlock = require(path.join(process.cwd(), 'models', 'tileblock'));

/* Fetching tileblock datas*/
var init = function (app) {
  settingsConf = app.get('settings');
};

/*var get = function (req, res, next) {
  options.lean = true;
  query = { "_id": { $in: req.body.blockIds } };

  tileBlock.find(query, {}, options, function (err, result) {
    res.send(result);
  });
};*/

var save = function (req, res, next) {
  var obj = req.body.form_data;

  if (__util.isNullOrEmpty(obj._id)) {
    saveBlock(obj, function (result) {
      var resObj = { "_id": result };
      res.send(resObj);
    });
  } else {
    options = {};
    query = {};
    query._id = obj._id;
    delete obj["_id"];

    $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.tileBlocks, query, options, obj, function (result) {
      var resObj = { "_id": query._id };
      res.send(resObj);
    });
  }
};


/* Fetching TileBlocks */
var getBlocks = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.params.tileId)) {
    query._id = req.params.tileId;

    $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tile, query, options, function (result) {
      if (result.length > 0) {
        var concat = Array.prototype.concat;
        var blockIds = [];

        if (result[0].displayWidgets && result[0].displayWidgets.length > 0) {
          blockIds = concat.call(blockIds, result[0].displayWidgets);
        }

        if (result[0].formWidgets && result[0].formWidgets.length > 0) {
          blockIds = concat.call(blockIds, result[0].formWidgets);
        }

        if (result[0].blocks && result[0].blocks.length > 0) {
          blockIds = concat.call(blockIds, result[0].blocks);
        }

        //if (!__util.isNullOrEmpty(context.query.lang) && context.query.lang !== "en" && result[0][context.query.lang]) {
        // blockIds = (result[0][context.query.lang]).blocks;
        //}

        $tileblock._getBlocks(blockIds, function (blocks) {
          res.send(blocks);
        });
      } else {
        res.send([]);
      }
    });
  } else {
    var blockIds = req.body.blockIds;

    $tileblock._getBlocks(blockIds, function (blocks) {
      res.send(blocks)
    });
  }
};


/*Fetching profile datas for the current selected organization*/
var getProfile = function (req, res, next) {
  var orgId = req.params.orgId;
  var language = (!__util.isNullOrEmpty(req.params.language) ? req.params.language : "en");
  var authDomain = settingsConf.authDomain;

  var url = authDomain + '/migrate/get_org_structure/' + orgId + '/' + language;

  var options = {
    url: url,
    method: "GET"
  };

  $general.getUrlResponseWithSecurity(options, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    var urlResult = (!error && response.statusCode == 200) ? body : [];
    res.send(urlResult);
  });
};

var _getBlocks = function (blockIds, cb) {
  query = {};
  options = {};
  query._id = blockIds;

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tileBlocks, query, options, function (blockDatas) {
    var blocks = [];
    blockDatas = blockDatas && blockDatas.length > 0 ? $general.convertToJsonObject(blockDatas) : [];

    cb(blockDatas);
  });
};

var widgetCategoryList = function (req, res, next) {
  query = {};
  options = {};
  options["sort"] = [['name', 'asc']];
  query["organizationId"] = req.params.orgId;

  if (!__util.isNullOrEmpty(query["organizationId"]) && query["organizationId"] !== "-1") {
    $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.widgetCategory, query, options, function (result) {
      res.send(result);
    });
  } else {
    res.send([]);
  }
};

var saveBlock = function (obj, cb) {
  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.tileBlocks, obj, function (result) {
    cb(result);
  });
};

var updateBlock = function (query, options, obj, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.tileBlocks, query, options, obj, function (result) {
    cb(result);
  });
};

var block = function (query, options, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.tileBlocks, query, options, function (blocks) {
    if (blocks && blocks.length > 0) {
      cb(blocks);
    } else {
      cb([]);
    }
  });
};

var _remove = function (blockQuery, options, cb) {
  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.tileBlocks, blockQuery, options, function (result) {
    var obj = {};
    obj.deleted = result;

    cb(obj);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "saveBlock": saveBlock,
  "getBlocks": getBlocks,
  "getProfile": getProfile,
  "_getBlocks": _getBlocks,
  "widgetCategoryList": widgetCategoryList,
  "updateBlock": updateBlock,
  "block": block,
  "_remove": _remove
};
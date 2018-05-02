var settingsConf;
var options = {};
var query = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var saveWeight = function (req, res, next) {
  var obj = req.body.form_data;

  var existingTiles = [];

  if (obj && !__util.isEmptyObject(obj) && obj.hasOwnProperty("existingTiles") && obj.existingTiles.length > 0) {
    existingTiles = obj.existingTiles;
    delete obj["existingTiles"];
  }

  obj = setWeight(obj, req);

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.qaweights, obj, function (result) {
    var wgRes = {};
    wgRes._id = result;

    tileWeightUpdate(existingTiles, obj);
    res.send(wgRes);
  });
};

var getWeight = function (req, res, next) {
  query = {};
  options = {};

  if (!__util.isNullOrEmpty(req.params.orgId)) {
    query["organizationId"] = $db.objectId(req.params.orgId);
  }

  options.sort = [['dateUpdated', 'desc']];

  get(query, options, function (result) {
    res.send(result);
  });
};

var getAppTilesSquares = function (req, res, next) {
  $async.parallel({
    tiles: function (cb) {
      query = {};
      query.organizationId = req.params.orgId;

      $tile.getSpecificFields({}, query, {}, function (tiles) {
        cb(null, tiles);
      });
    },
    apptiles: function (cb) {
      $page.getAllTileIdsAssignedToApp(req.params.orgId, function (pages) {
        cb(null, pages);
      });
    }
  }, function (err, result) {
    var resultMain = {
      "tiles": result.tiles,
      "apptiles": result.apptiles,
    };

    res.send(resultMain);
  });
};

var setWeight = function (obj, req) {
  if (obj && !__util.isEmptyObject(obj)) {
    var uObj = $authtoken.get(req.cookies.token);

    obj["updatedBy"] = $db.objectId(uObj.uid);
    obj["dateUpdated"] = $general.getIsoDate();

    if (!obj.hasOwnProperty("_id")) {
      obj["createdBy"] = $db.objectId(uObj.uid);
      obj["dateCreated"] = $general.getIsoDate();
    }

    if (obj.hasOwnProperty("organizationId")) {
      obj["organizationId"] = $db.objectId(obj.organizationId);
    }

    if (obj.hasOwnProperty("tileId")) {
      obj.tileId = _.map(obj.tileId, id => $db.objectId(id))
    }
  }

  return obj;
};

var tileWeightUpdate = function (existingTiles, obj, mainCb) {
  var currTileIds = obj && !__util.isEmptyObject(obj) && obj.hasOwnProperty("tileId") && obj.tileId.length > 0 ? _.map(obj.tileId, id => id.toString()) : [];
  var matchedTileIds = _.union(existingTiles, currTileIds);

  if (matchedTileIds && matchedTileIds.length > 0) {
    $async.waterfall([
      function (cb) {
        var weightQuery = {};
        var tileObjIds = _.map(matchedTileIds, id => $db.objectId(id));
        //weightQuery["organizationId"] = obj.organizationId;

        weightQuery["tileId"] = { $in: tileObjIds };
        var weightTileIds = [];

        get(weightQuery, {}, function (weighRes) {
          weighRes = weighRes && weighRes.length > 0 ? $general.convertToJsonObject(weighRes) : [];

          if (weighRes.length > 0) {
            weightTileIds = getWeightTileIds(weighRes);
          }

          cb(null, weightTileIds);
        });
      }], function (err, weightTileIds) {
        _.each(matchedTileIds, function (currTileId, index) {
          var updateObj = {};
          var tileUpdateQuery = { "_id": currTileId };

          updateObj["isWeight"] = weightTileIds.indexOf(currTileId) > -1 ? true : false;

          $tile.tileUpdate(tileUpdateQuery, {}, updateObj, function (result) {
          });
        });

        if (mainCb) {
          mainCb(true);
        }
      });
  } else {
    if (mainCb) {
      mainCb(false);
    }
  }
};

var get = function (qAQuery, qaOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.qaweights, qAQuery, qaOptions, function (result) {
    cb(result);
  })
};

var getWeightTileIds = function (weighRes) {
  var tileIds = [];

  _.each(weighRes, function (wgObj, index) {
    tileIds = _.union(tileIds, wgObj.tileId);
  });

  return tileIds;
};

var removeWeight = function (req, res, next) {
  options = {};
  query = {};
  var existingTiles = [];
  var obj = {};

  if (!__util.isNullOrEmpty(req.params.weightId)) {
    query._id = req.params.weightId;
  } else if (req.body.hasOwnProperty("form_data") && !__util.isEmptyObject(req.body.form_data)) {
    query = req.body.form_data;

    if (query.hasOwnProperty("existingTiles")) {
      existingTiles = query.existingTiles;

      delete query["existingTiles"];
    }
  }

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.qaweights, query, options, function (result) {
    if (existingTiles.length > 0) {
      tileWeightUpdate(existingTiles, {});
    }

    res.send(result);
  });
};

module.exports = {
  "init": init,
  "saveWeight": saveWeight,
  "getWeight": getWeight,
  "removeWeight": removeWeight,
  "getAppTilesSquares": getAppTilesSquares,
  "get": get
};
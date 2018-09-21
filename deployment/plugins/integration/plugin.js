const request = require('request');
var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  let obj = req.body.form_data;

  $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.integration, obj, function (result) {
    obj = {};
    obj._id = result;

    res.send(obj);
  });
};

var list = function (req, res, next) {
  let query = {};

  if (!__util.isNullOrEmpty(req.params.appid)) {
    query.appId = req.params.appid;
  }

  if (!__util.isEmptyObject(req.body.form_data)) {
    query = req.body.form_data;
  }

  options = {};
  options.sort = [['userName', 'asc']];

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.integration, query, options, function (result) {
    res.send(result);
  });
};

var update = function (req, res, next) {
  let query = {};
  let integration = {};
  query._id = req.params.id;

  if (!__util.isEmptyObject(req.body.form_data)) {
    integration = req.body.form_data;
  }

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.integration, query, options, integration, function (result) {
    integration = {};
    integration._id = result;

    res.send(integration);
  });
};

var remove = function (req, res, next) {
  let query = {};
  query._id =  req.params.id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.integration, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var getIntegrations = function (query, cb) {
  let options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.integration, query, options, function (result) {
    cb(result);
  });
};

var getIntegrationsByApp = function (req, res, next) {
  let query = {};

  if (!__util.isNullOrEmpty(req.params.appid)) {
    query.appId = {
      $in: [req.params.appid]
    };
  }

  $integration.getIntegrations(query, function (result) {
    if (result && result.length > 0) {
      _processIntegration(result, function (integratedDatas) {

        res.send(integratedDatas);
      });
    } else {
      res.send(result);
    }
  });
};

var _processIntegration = function (integrations, cb) {
  let widgetIds = [];
  let typeIds = [];
  integrations = $general.convertToJsonObject(integrations);

  _.each(integrations, function (data, index) {
    if (!__util.isNullOrEmpty(data.typeId) && typeIds.indexOf(data.typeId) == -1) {
      typeIds.push(data.typeId);
    }

    if (data.widgetIds.length > 0) {
      widgetIds = _addWidgetsIds(data.widgetIds, widgetIds);
    }
  });

  let queryTypeIds = {};
  queryTypeIds._id = typeIds;

  let queryWidgetsIds = {};
  queryWidgetsIds._id = widgetIds;

  $integrationtype.getIntegrationTypes(queryTypeIds, function (intTypes) {
    if (intTypes && intTypes.length > 0) {
      intTypes = $general.convertToJsonObject(intTypes);
    }

    $integrationwidgets.getIntegrationWidgets(queryWidgetsIds, function (intWidgets) {
      if (intTypes && intTypes.length > 0) {
        intWidgets = $general.convertToJsonObject(intWidgets);
      }

      var integratedDatas = _constructIntegratedDatas(intTypes, intWidgets, integrations);
      cb(integratedDatas);
    });
  });
};

var _addWidgetsIds = function (dataIds, widgetsIds) {
  var integratedIds = dataIds;

  _.each(integratedIds, function (id, index) {
    if (integratedIds.indexOf(id) == -1) {
      integratedIds.push(id);
    }
  });

  return integratedIds;
};

var _constructIntegratedDatas = function (intTypes, intWidgets, integrations) {
  var integratedDatas = [];
  var typeNames = {};
  var widgetNames = {};

  _.each(integrations, function (data, index) {
    if (!__util.isNullOrEmpty(data.typeId)) {
      var typeBlock = _.findWhere(intTypes, {
        "_id": data.typeId
      });

      typeNames[data.typeId] = typeBlock.name;
    }

    data.typeNames = typeNames;

    if (data.widgetIds.length > 0) {
      _.each(data.widgetIds, function (wId, index) {
        var widgetBlock = _.findWhere(intWidgets, {
          "_id": wId
        });

        widgetNames[wId] = widgetBlock.name;
      });
    }

    data.widgetNames = widgetNames;
    integratedDatas.push(data);
  });

  return integratedDatas;
};

var integrationsByApp = function (query, cb) {
  options = {};

  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.integration, query, options, function (integrations) {
    if (integrations && integrations.length > 0) {
      $integrationtype.getIntegrationTypes({}, function (types) {
        types = $general.convertToJsonObject(types);

        _.each(integrations, function (intData, index) {
          _.each(types, function (typeData, index) {
            if (intData.typeId == typeData._id) {
              intData["typeName"] = typeData.name;
            }
          });
        });

        cb(integrations);
      });
    } else {
      cb(integrations);
    }
  });
};

var getCCBData = function (req, res, next) {
  var searchData = req.body;
  var searchUrl = 'https://multisite.ccbchurch.com/api.php?srv=individual_search&';

  var credentials = {
    username: "ASAVijay",
    password: "Welcome@123***###"
  };

  $async.parallel({
    email: function (callback) {
      if (!__util.isNullOrEmpty(searchData.email)) {
        var emailSearch = {
          "url": searchUrl + "email=" + searchData.email,
          "auth": credentials
        };

        _getCCB(emailSearch, function (resultData) {
          callback(null, resultData);
        });

      } else {
        callback(null, "");
      }
    },
    firstlast: function (callback) {
      if (!__util.isNullOrEmpty(searchData.firstName) || !__util.isNullOrEmpty(searchData.lastName)) {
        var firstLastSearch = {};

        if (!__util.isNullOrEmpty(searchData.firstName)) {
          firstLastSearch.url = searchUrl + "first_name=" + searchData.firstName;
        }

        if (!__util.isNullOrEmpty(searchData.lastName)) {
          firstLastSearch.url = !__util.isNullOrEmpty(searchData.firstName) ? firstLastSearch.url + "&last_name=" + searchData.lastName : searchUrl + "last_name=" + searchData.lastName;
        }

        firstLastSearch["auth"] = credentials;

        _getCCB(firstLastSearch, function (resultData) {
          callback(null, resultData);
        });
      } else {
        callback(null, "");
      }
    },
    cellphone: function (callback) {
      if (!__util.isNullOrEmpty(searchData.cellPhone)) {
        var cellPhoneSearch = {};
        cellPhoneSearch.url = searchUrl + "phone=" + searchData.cellPhone;
        cellPhoneSearch["auth"] = credentials;

        _getCCB(cellPhoneSearch, function (resultData) {
          callback(null, resultData);
        });
      } else {
        callback(null, "");
      }
    },
    homephone: function (callback) {
      if (!__util.isNullOrEmpty(searchData.homePhone)) {
        var homePhoneSearch = {};
        homePhoneSearch.url = searchUrl + "phone=" + searchData.homePhone;
        homePhoneSearch["auth"] = credentials;

        _getCCB(homePhoneSearch, function (resultData) {
          callback(null, resultData);
        });
      } else {
        callback(null, "");
      }
    }
  }, function (err, results) {
    res.send(results);
  });
};

var _getCCB = function (fetchOptions, cb) {
  request(fetchOptions, function (err, res, body) {
    if (err) {
      cb(err);
    }
    cb(body);
  });
};

var updateCCBIndividual = function (req, res, next) {
  var updateData = req.body;
  var updateUrl = "https://multisite.ccbchurch.com/api.php?srv=update_individual&individual_id=" + context.params[0];

  var updateIndividual = {
    "url": updateUrl,
    "auth": {
      username: "ASAVijay",
      password: "Welcome@123***###"
    },

    "form": updateData
  };

  request.post(updateIndividual, function (error, response, body) {
  });
};

var individualSave = function (req, res, next) {
  var saveData = req.body;
  var saveUrl = "https://multisite.ccbchurch.com/api.php?srv=create_individual";

  var saveIndividual = {
    "url": saveUrl,
    "auth": {
      username: "ASAVijay",
      password: "Welcome@123***###"
    },

    "form": saveData
  };

  request.post(saveIndividual, function (error, response, body) {
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "update": update,
  "remove": remove,
  "getIntegrationsByApp": getIntegrationsByApp,
  "getCCBData": getCCBData,
  "updateCCBIndividual": updateCCBIndividual,
  "individualSave": individualSave
};

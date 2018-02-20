'use strict';
var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var save = function (req, res, next) {
  let orgType = {};
  let organization = req.body.form_data;

  if (!__util.isNullOrEmpty(req.params.name)) {
    orgType.name = req.params.name;
    orgType.type = 'AdminRights';
  }

  let tokenObj = $authtoken.get(req.cookies.token);

  if (__util.isNullOrEmpty(organization._id)) {
    organization.createdBy = tokenObj.uid;

    $db.save(settingsConf.dbname.tilist_core, settingsConf.collections.organization, organization, function (result) {
      organization = {};
      organization._id = result;

      __util.createDir(settingsConf.folderPath + organization._id);

      if (!__util.isNullOrEmpty(req.params.name)) {
        $access._getAccess(orgType, function (objAccess) {
          if (objAccess.length > 0) {
            _processOrgsByType(objAccess[0], organization, function (obj) {
              let tileCategory = {};
              tileCategory.name = "Default";
              tileCategory.organizationId = organization._id;
              tileCategory.color = "";

              $tilecategory._saveTileCategory(tileCategory, function (category) {
                res.send(organization);
              });
            });
          } else {
            res.send(organization);
          }
        });
      } else {
        res.send(organization);
      }
    });
  } else {
    let options = {};
    let query = {};
    query._id = organization._id;
    delete organization["_id"];

    orgUpdate(query, options, organization, function (result) {
      let orgToUpdate = {};
      orgToUpdate._id = query._id;

      res.send(orgToUpdate);
    });
  }
};

var list = function (req, res, next) {
  let query = {};

  if (!__util.isEmptyObject(req.body.form_data)) {
    query = JSON.parse(req.body.form_data);
  }

  let options = {};
  options.sort = [['name', 'asc']];

  getOrgs(query, options, function (result) {
    res.send(result);
  });
};

var remove = function (req, res, next) {
  let query = {};
  query._id = req.body._id;

  $db.remove(settingsConf.dbname.tilist_core, settingsConf.collections.organization, query, options, function (result) {
    let obj = {};
    obj.deleted = result;

    res.send(obj);
  });
};

var _processOrgsByType = function (type, org, cb) {
  let accessType = $general.convertToJsonObject(type);
  let organization = org;
  let count = 0;
  let recordGet = {
    "assignedAccess._id": accessType._id,
    "isAdmin": true
  };

  $user._getOrgMembers(recordGet, function (orgMembers) {
    _.each(orgMembers, function (orgMem, index) {
      orgMem = $general.convertToJsonObject(orgMem);
      let orgsIds = [];
      let recordId = {
        "_id": orgMem._id
      };

      let recordToUpdate = {};
      orgsIds = orgMem.organizationId;
      orgsIds.push(organization._id);
      recordToUpdate.organizationId = orgsIds;

      $user._updateOrgsMembers(recordId, recordToUpdate, function (result) {
        count++;

        if (count == orgMembers.length) {
          cb("success");
        }
      });
    });

    if (orgMembers.length == 0) {
      cb("success");
    }
  });
};

var update = function (req, res, next) {
  let query = {};
  let orgToUpdate = {};
  let options = {};

  query._id = req.params.id;
  var appIds = [];
  var publishing = false;

  if (!__util.isEmptyObject(req.body.form_data)) {
    orgToUpdate = JSON.parse(req.body.form_data);
    appIds = orgToUpdate.appIds;
    publishing = orgToUpdate.publishing;
    delete orgToUpdate["appIds"];
  }

  orgUpdate(query, options, orgToUpdate, function (result) {
    orgToUpdate = {};
    orgToUpdate._id = result;

    if (appIds.length > 0) {
      var appsUpdate = {
        "publishing": publishing
      };
      _.each(appIds, function (id) {
        $apps.update(id, appsUpdate);
      });
    }

    res.send(orgToUpdate);
  });
};

var orgUpdate = function (query, options, dataToUpdate, cb) {

  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.organization, query, options, dataToUpdate, function (result) {
    cb(result);
  });
};

var getList = function (query, cb) {
  let options = {};
  options.sort = [['name', 'asc']];

  $db.select(settingsConf.dbname.tilist_core.tilist_core, settingsConf.collections.organization, query, options, function (result) {
    cb(result);
  });
};

var getOrgPackage = function (req, res, next) {
  let query = {};
  let options = {};
  query["_id"] = req.params.orgId;

  getOrgs(query, options, function (orgResult) {
    if (orgResult && orgResult.length > 0 && !__util.isNullOrEmpty(orgResult[0].packageId)) {
      query["_id"] = orgResult[0].packageId;

      $package.getPackage(query, options, function (result) {
        res.send(result);
      });
    } else {
      res.send([]);
    }
  });
};

var packageUpdate = function (req, res, next) {
  let query = {};
  let options = {};

  let dataToUpdate = {};
  query._id = req.params.id;

  options = {
    upsert: true
  };

  if (!__util.isEmptyObject(req.body.form_data)) {
    dataToUpdate = req.body.form_data;
  }

  orgUpdate(query, options, dataToUpdate, function (result) {
    let orgUpdated = {};
    orgUpdated._id = result;

    res.send(orgUpdated);
  });
};

var getOrgs = function (oQuery, oOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.organization, oQuery, oOptions, function (result) {
    cb(result);
  });
};

module.exports = {
  "init": init,
  "save": save,
  "list": list,
  "getList": getList,
  "remove": remove,
  "update": update,
  "packageUpdate": packageUpdate,
  "getOrgPackage": getOrgPackage
};


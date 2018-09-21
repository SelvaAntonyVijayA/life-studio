var patientDashboard = require("./patient_dashboard.js");
const util = require('util');
var options = {};
var query = {};

var saveHsrStatus = function (settingsConf, orgId, cb) {
    $async.waterfall([
      function (mainCb) {
        var appsQuery = { "organizationId": orgId };
  
        _getApps(settingsConf, appsQuery, {}, function (orgApps) {
          orgApps = orgApps && orgApps.length > 0 ? $general.convertToJsonObject(orgApps) : [];
          mainCb(null, orgApps);
        });
      },
      function (apps, mainCb) {
        var locations = [];
  
        if (apps && apps.length > 0) {
          var appIds = apps && apps.length > 0 ? _.pluck(apps, "_id") : [];
          var locationQuery = { "appId": { $in: appIds } };
  
          _getLocs(settingsConf, locationQuery, {}, function (locs) {
            locations = locs && locs.length > 0 ? $general.convertToJsonObject(locs) : [];
            mainCb(null, apps, locations);
          });
        } else {
          mainCb(null, apps, locations);
        }
      }
    ], function (err, apps, locations) {
      if (apps.length > 0 && locations.length > 0) {
        $async.each(apps, function (appObj, appLoop) {
          var appId = appObj._id;
  
          var appLocs = _.filter(locations, function (locObj) {
            return locObj.appId == appId;
          });
  
          if (appLocs.length > 0) {
            $async.each(appLocs, function (loc, locLoop) {
              var obj = { "orgId": orgId, "appId": appId, "locationId": loc._id };
  
              patientDashboard.getHsrStatus(obj, settingsConf, true, function (hsrRes) {
                locLoop();
              });
            }, function () {
              appLoop();
            });
          } else {
            appLoop();
          }
        }, function () {
          if (cb) {
            cb(true);
          }
        });
  
      } else {
        if (cb) {
          cb(false);
        }
      }
    });
  };

  var _getApps = function (settingsConf, aQuery, aOptions, cb) {
    $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.apps, aQuery, aOptions, function (result) {
      cb(result);
    });
  };

  var _getLocs = function (settingsConf, lQuery, lOptions, cb) {
    $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.location, lQuery, lOptions, function (result) {
      cb(result);
    });
  };
  
  module.exports = {
    "saveHsrStatus": saveHsrStatus
  };
const request = require('request');
const querystring = require('querystring');
const http = require('http');
var settingsConf;
var migrationConf;

var init = function (app) {
  settingsConf = app.get('settings');
  migrationConf = settingsConf["datamigration"];
};

var migration = function (req, res, next) {
  let data = req.body;
  let obj = {};
  obj.data = data;
  obj.success = true;

  res.send(obj);
};

var appSave = function (data, done) {
  $async.waterfall([
    function (callback) {
      let query = {};
      query._id = data.organizationId;

      $organization.getList(query, function (organization) {
        callback(null, organization[0]);
      });
    }], function (error, organization) {
      _getAppLocationSettings(data, organization, function (fields) {
        if (__util.isNullOrEmpty(migrationConf.appUrl)) {
          if (done) {
            done({});
          }

        } else {
          var appData = [];

          if (!__util.isNullOrEmpty(data.organizationId)) {
            appData.push(_returnAppDetails(data, organization, fields));
          }

          if (appData.length == 0) {
            if (done) {
              done({
                success: false
              });
            }

            return;
          }

          _request(migrationConf.appUrl, {
            app: appData
          }, function (result) {
            if (done) {
              done(result);
            }
          });
        }
      });
    });
};

var userSave = function (data, done) {
  if (__util.isNullOrEmpty(migrationConf.userUrl)) {
    if (done) {
      done({});
    }
  } else {
    _requestUser(migrationConf.userUrl, data, function (result) {
      if (done) {
        done(result);
      }
    });
  }
};

var appMigration = function (req, res, next) {
  _appMigration(req.params.id, function (data) {

    if (__util.isNullOrEmpty(migrationConf.appUrl)) {
      res.send({});

    } else {
      _request(migrationConf.appUrl, data, function (result) {
        res.send(data);
      });
    }
  });
};

var memberMigration = function (req, res, next) {
  let appIds = [];

  _appMigration("", function (apps) {
    $async.each(apps.app, function (app, apploop) {

      _memberMigration(app.appId, req.params.id, function (appmembers) {
        _request(migrationConf.userBulkUrl, appmembers, function (result) {
          appIds.push(app.appId);

          apploop();
        });
      });

    }, function () {
      res.send({ appId: appIds });
    });
  });
};

var _appMigration = function (appId, acb) {
  let appData = [];

  $async.waterfall([
    function (callback) {
      $async.parallel({
        app: function (done) {
          let query = {};

          if (!__util.isNullOrEmpty(appId)) {
            query = {
              _id: appId
            };
          }

          $apps.getAppsByIds(query, function (apps) {
            done(null, apps);
          });
        },
        organization: function (callback) {
          let query = {};

          $organization.getList(query, function (organizations) {
            callback(null, organizations);
          });
        }
      }, function (err, results) {
        callback(null, results);
      });
    }], function (error, datas) {
      let organizations = $general.convertToJsonObject(datas.organization);
      let apps = $general.convertToJsonObject(datas.app);

      $async.each(apps, function (app, loop) {
        let organization = _.findWhere(organizations, {
          "_id": app.organizationId
        });

        if (organization) {
          _getAppLocationSettings(app, organization, function (fields) {
            appData.push(_returnAppDetails(app, organization, fields));

            loop();
          });
        } else {
          loop();
        }

      }, function () {
        let data = {
          app: appData
        };

        acb(data);
      });
    });
};

var _memberMigration = function (appId, memberId, mcb) {
  let userData = [];

  $async.waterfall([
    function (callback) {
      let mquery = {};
      let options = {};

      if (!__util.isNullOrEmpty(memberId)) {
        mquery._id = memberId;
      } else if (!__util.isNullOrEmpty(appId)) {
        mquery.appId = appId;
      }

      $member._getMember(mquery, options, function (members) {
        callback(null, members);
      });
    }], function (error, members) {
      $async.each(members, function (member, loop) {
        if (!__util.isEmptyObject(member.login) && !__util.isNullOrEmpty(member.appId)) {
          userData.push(_returnMemberDetails(member));
        }

        loop();
      }, function () {
        let data = {
          user_data: userData
        };

        mcb(data);
      });
    });
};

var _getAppLocationSettings = function (app, organzation, done) {
  $async.waterfall([
    function (callback) {
      if (!__util.isEmptyObject(app) && !__util.isNullOrEmpty(app._id.toString()) && !__util.isEmptyObject(organzation) && !__util.isNullOrEmpty(organzation._id.toString())) {
        let options = {};
        let query = {};
        query.appId = app._id.toString();
        query.organizationId = !__util.isNullOrEmpty(organzation._id.toString()) ? organzation._id.toString() : "";

        $location.getList(query, function (locations) {
          callback(null, locations);
        });
      } else {
        callback(null, []);
      }
    },
    function (locations, callback) {
      let query = {};
      query.appId = app._id.toString();

      if (locations.length > 0) {
        query.locationId = locations.length > 0 ? locations[0]._id.toString() : "";
      }
      if (!__util.isEmptyObject(organzation) && !__util.isNullOrEmpty(organzation._id.toString())) {
        query.organizationId = organzation._id.toString();
        let options = {};

        $pagesettings._get(query, options, function (settings) {
          callback(null, settings);
        });
      } else {
        callback(null, []);
      }
    }], function (error, settings) {
      _profileSettings(settings, function (fields) {
        if (done) {
          done(fields);
        }
      });
    });
};

var _profileSettings = function (settings, cb) {
  let fields = ['title', 'firstName', 'middleName', 'lastName', 'nickName', 'email', 'dob', 'gender', 'address', 'city', 'state', 'zipcode', 'country', 'homePhone', 'cellPhone', 'company', 'organization', 'group', 'division', 'jobFunction'];
  let fieldsAdd = ['title', 'first', 'middle', 'last', 'nickName', 'email', 'dob', 'gender', 'address', 'city', 'state', 'zipcode', 'country', 'homePhone', 'cellPhone', 'company', 'organization', 'group', 'division', 'jobFunction'];
  let fieldsArray = [];

  if (settings.length == 0) {
    _.each(fieldsAdd, function (field, index) {
      let obj = {};
      obj.name = fields[index];
      obj.required = false;

      fieldsArray.push(obj);
    });

    return cb(fieldsArray);
  }

  var tileIds = _getAllTiles(settings);
  let query = {};
  query._id = tileIds;

  $tile._getSquares(query, 'settings', 'profile', function (tileDatas) {
    let block = tileDatas.length > 0 ? tileDatas[0] : {};
    let data = tileDatas.length > 0 ? block.data : {};

    _.each(fieldsAdd, function (field, index) {
      let obj = {};
      let key = Object.keys(data);
      let dataIndex = key.indexOf(field);
      let mandatory = field + "Mandatory";
      let mandatoryIndex = key.indexOf(mandatory);

      if (data) {
        if (dataIndex >= 0 && data[field]) {
          obj.name = fields[index];

          if (mandatoryIndex != -1) {
            obj.required = data[mandatory] ? true : false;
          }

          fieldsArray.push(obj);
        }
      }
    });

    cb(fieldsArray);
  });
};

var _getAllTiles = function (settings) {
  let allTiles = [];

  _.each(settings, function (setting) {
    _.find(setting.menuTiles, function (item, index) {
      if (item.linkTo && item.linkTo.toLowerCase() == 'tile') {
        allTiles.push(item.linkId);
      }
    });
  });

  return allTiles;
};

var _returnAppDetails = function (app, organization, fields) {
  let data = {};
  data.appId = app._id.toString();
  data.appName = !__util.isNullOrEmpty(app.name) ? app.name : "";
  data.orgId = app.organizationId;
  data.orgName = organization && !__util.isNullOrEmpty(organization.name) ? organization.name : "";
  data.pin = !__util.isNullOrEmpty(app.pin) ? app.pin : 0;
  data.auth = !__util.isNullOrEmpty(app.authenticated) ? app.authenticated : 3;
  data.fields = fields;

  return data;
};

var _returnMemberDetails = function (member) {
  let data = {};
  data.id = !__util.isNullOrEmpty(member._id) ? member._id.toString() : "";
  data._id = !__util.isNullOrEmpty(member._id) ? member._id.toString() : "";
  data.appId = member.appId;

  data.title = !__util.isNullOrEmpty(member.title) ? member.title : "";
  data.firstName = !__util.isNullOrEmpty(member.firstName) ? member.firstName : "";
  data.middleName = !__util.isNullOrEmpty(member.middleName) ? member.middleName : "";
  data.lastName = !__util.isNullOrEmpty(member.lastName) ? member.lastName : "";
  data.nickName = !__util.isNullOrEmpty(member.nickName) ? member.nickName : "";
  data.email = !__util.isNullOrEmpty(member.email) ? member.email : "";
  data.dob = !__util.isNullOrEmpty(member.dob) ? member.dob : "";
  data.gender = !__util.isNullOrEmpty(member.gender) ? member.gender : "";
  data.address = !__util.isNullOrEmpty(member.address) ? member.address : "";
  data.address1 = !__util.isNullOrEmpty(member.address1) ? member.address1 : "";
  data.city = !__util.isNullOrEmpty(member.city) ? member.city : "";
  data.state = !__util.isNullOrEmpty(member.state) ? member.state : "";
  data.zipcode = !__util.isNullOrEmpty(member.zipcode) ? member.zipcode : "";
  data.country = !__util.isNullOrEmpty(member.country) ? member.country : "";
  data.homePhone = !__util.isNullOrEmpty(member.homePhone) ? member.homePhone : "";
  data.cellPhone = !__util.isNullOrEmpty(member.cellPhone) ? member.cellPhone : "";
  data.company = !__util.isNullOrEmpty(member.company) ? member.company : "";
  data.organization = !__util.isNullOrEmpty(member.organization) ? member.organization : "";
  data.group = !__util.isNullOrEmpty(member.group) ? member.group : "";
  data.division = !__util.isNullOrEmpty(member.division) ? member.division : "";
  data.jobFunction = !__util.isNullOrEmpty(member.jobFunction) ? member.jobFunction : "";

  if (member && member.user_pin) {
    data.user_pin = !__util.isNullOrEmpty(member.user_pin) ? member.user_pin : "";
  }

  if (member && member.app_pin) {
    data.app_pin = !__util.isNullOrEmpty(member.app_pin) ? member.app_pin : "";
  }

  data.verified = !__util.isNullOrEmpty(member.verified) ? member.verified : "1";
  data.isApproved = !__util.isNullOrEmpty(member.isApproved) ? member.isApproved : true;
  data.login = member.login;

  if (!__util.isEmptyObject(data.login) && !__util.isNullOrEmpty(data.login[0]) && !__util.isNullOrEmpty(data.login[0].password)) {
    data.email = data.login[0].email;
    data.password = $general.decrypt(data.login[0].password);
    data.login[0].password = $general.decrypt(data.login[0].password);
  }

  return data;
};

var _request = function (url, data, cb) {
  url = appConf.authDomain + url;
  let options = {
    uri: url,
    method: 'POST',
    json: data
  };

  $general.getUrlResponseWithSecurity(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb({
        data: data,
        count: data.length,
        success: true
      });

    } else {
      $log.error('data migration : ' + error);
      cb({
        success: false,
        body: body
      });
    }
  });
};

var _requestUser = function (url, data, cb) {
  url = appConf.authDomain + url;

  let options = {
    uri: url,
    method: 'POST',
    json: data
  };

  $general.getUrlResponseWithSecurity(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      cb({
        data: data,
        count: data.length,
        success: body.status,
        message: body.message
      });

    } else {
      $log.error('data migration : ' + error);

      cb({
        success: false,
        body: body
      });
    }
  });
};

module.exports = {
  "init": init,
  "appMigration": appMigration,
  "memberMigration": memberMigration,
  "migration": migration
};
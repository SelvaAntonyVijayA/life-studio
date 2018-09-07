var query = {};
var options = {};
var fs = require('fs');
var json2xls = require('json2xls');
var xlsx = require('node-xlsx');
var settingsConf;

var init = function (app) {
  settingsConf = app.get('settings');
};

var makeExcelSheet = function (req, res, next) {
  var jsonData = req.body.form_data;
  var xls = json2xls(jsonData);
  var appId = req.params.appId;
  var fileName = "member_" + appId + ".xlsx";
  var filePath = settingsConf.path + settingsConf.excel.folderpath.replace('{0}', fileName);

  fs.writeFile(filePath, xls, "binary", function (err, content) {
    var obj = { success: true };

    if (err) {
      obj.success = false;
      obj.message = 'Unable to download file. Please try Again!!!';
    }

    obj.fileName = fileName;

    res.send(obj);
  });
};

var members = function (req, res, next) {
  // var retrn = {};
  // var fileName;
  var appId;
  var locationId;
  var profile = [];

  if (!__util.isEmptyObject(req.body) && !__util.isNullOrEmpty(req.body.profile)) {
    profile = req.body.profile;
  } else {
    res.send({ success: false, message: 'Profile not exists for app.' });
  }

  if (!__util.isEmptyObject(req.body) && req.body.hasOwnProperty("appId") && !__util.isNullOrEmpty(req.body.appId)) {
    appId = context.data.appId;
  } else {
    res.send({ success: false, message: 'Invalid request.' });
  }

  if (!__util.isEmptyObject(req.body) && req.body.hasOwnProperty("locationId") && !__util.isNullOrEmpty(req.body.locationId)) {
    locationId = req.body.locationId;
  }

  _formParse(req, function (data, files) {
    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];
          var sheets = xlsx.parse(fs.readFileSync(file.path));
          var datas = sheets[0].data;
          var fields = [];
          var memberDatas = [];

          _.each(datas, function (mem, index) {
            if (index == 0) {
              fields = mem;
            } else {
              memberDatas.push(mem);
            }
          });

          _importMember(appId, locationId, profile, fields, memberDatas, function (content) {
            res.send(content);
          });
        }
      } else {
        res.send({ success: false, message: 'Please select the excel sheet!!' });
      }
    } catch (err) {
      $log.error('import : ' + err);
      $log.error('import stack: ' + err.stack);
      res.send({ success: false, message: 'Error occurred, please try again later' });
    }
  });
};

var _importMember = function (appId, locationId, profile, fields, members, callBack) {
  $async.waterfall([
    function (cb) {
      $apps._getAppById(appId, function (appresult) {
        cb(null, appresult)
      });
    }], function (error, appresult) {
      var count = 0;
      var html = "<div>";
      var success = true;

      $async.each(members, function (member, eachCb) {
        var memberObj = {};
        memberObj = _getMemberObj(appId, locationId, profile, fields, member, appresult);
        if (memberObj.isProfile) {

          $member.memberSave(memberObj.data, function (result) {
            count++;
            if (result.success) {
              html += "<p><b>Record: " + count + " </b>&nbsp;&nbsp;";
              html += "<b>Message: </b>&nbsp;&nbsp;";
              html += "Success<br><br></p>";
            } else {
              if (success == true) {
                success = false;
              }

              html += "<p><b>Record:" + count + " </b>&nbsp;&nbsp;";
              html += "<b>Message: </b>&nbsp;&nbsp;";
              html += "" + result.message + "<br><br></p>";
            }

            eachCb();
          });
        } else {
          count++;

          html += "<p><b>Record:" + count + " </b>&nbsp;&nbsp;";
          html += "<b>Message: </b>&nbsp;&nbsp;";
          html += "Required field datas missing<br><br></p>";

          eachCb();
        }
      }, function () {
        var obj = {};
        obj.success = success;
        obj.message = html;

        callBack(obj);
      });
    });
};

var _getMemberObj = function (appId, locationId, profile, fields, memberData, appResult) {
  var login_identifiers = [];
  var obj = {};
  obj.appId = appId;
  obj.locationId = locationId;
  var profileObj = {};
  var login = {
    "type": "ili"
  };

  var isProfile = false;

  _.each(fields, function (dataField, index) {
    var name = dataField;
    var value = !__util.isNullOrEmpty(memberData[index]) ? memberData[index] : "";

    if (dataField.indexOf("*") > -1) {
      name = dataField.replace("*", "");
    } else {
      name = dataField;
    }

    if (name == "Request email verification (Yes/No)") {
      obj["verified"] = !__util.isNullOrEmpty(value) ? value.toLowerCase() == "no" ? "1" : "0" : "0";
    } else if (name == "End user is pre-approved (True/False)") {
      obj["isApproved"] = !__util.isNullOrEmpty(value) ? value.toString().toLowerCase() == "true" ? true : false : false;
    } else {
      var field = _.findWhere(profile, {
        'name': name
      });

      if (dataField.indexOf("*") > -1 && field) {
        isProfile = true;
      } else {
        if (isProfile == false) {
          isProfile = false;
        }
      }

      if (field) {
        if (field.role == "login identifier") {
          login_identifiers.push(field.tag);
        }

        if (field.tag == "email") {
          login["email"] = value;
        }
        else if (field.tag == "password") {
          login["password"] = value;
        } else {
          obj[field.tag] = value;
        }
      }
    }
  });

  login["login_identifiers"] = login_identifiers;

  obj.login = [login];

  if (appResult && appResult.length > 0) {
    if (!__util.isNullOrEmpty(appResult[0].authenticated) && (!__util.isNullOrEmpty(appResult[0].autoApprove) && appResult[0].autoApprove == true && appResult[0].authenticated == "1")) {
      obj.isApproved = true;
    }
  }

  var curDateTime = new Date();
  var currentDate = new Date(curDateTime).toUTCString();
  var dateTime = new Date(currentDate);

  if (obj.verified) {
    obj.verifiedOn = dateTime;
  }

  obj.dateCreated = dateTime;
  obj.lastUpdatedOn = dateTime;

  profileObj.data = obj;
  profileObj.isProfile = isProfile;

  return profileObj;
};

var _formParse = function (req, cb) {
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;

  form.parse(req, function (err, data, files) {
    cb(data, files);
  })
};

module.exports = {
  "init": init,
  "makeExcelSheet": makeExcelSheet,
  "members": members
};

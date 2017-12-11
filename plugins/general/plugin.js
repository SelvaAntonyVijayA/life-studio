var settingsConf;
var crypto = require('crypto');
//var mongoose = require('mongoose');
var request = require('request');
var secretkey = "m@tsya@0!#";
var hexType = 'hex';
var utfType = 'utf8';

var init = function (app) {
  settingsConf = app.get('settings');
};

var encrypt = function (str) {
  var encrypted = _cryptString(str, utfType, hexType);

  return encrypted;
};

var decrypt = function (str) {
  var decrypted = _cryptString(str, hexType, utfType);

  return decrypted;
};

var _cryptString = function (str, fromType, toType) {
  var cipher = crypto.createCipher('des-ede3-cbc', secretkey);
  var cryptedPassword = cipher.update(str, fromType, toType);
  cryptedPassword += cipher.final(toType);

  return cryptedPassword;
};

/*var convertToObjectId = function (data) {
  var mongoId = "";

  if (typeof data === "string") {
    mongoId = mongoose.Types.ObjectId(data);
  } else {
    mongoId = [];

    _.each(data, function (id, indx) {
      var curMgId = mongoose.Types.ObjectId(id);
      mongoId.push(curMgId)
    });
  }

  return mongoId;
};*/

var getMobileSecurityKey = function () {
  return settingsConf.general.mobileSecurityKey;
};

var getUrlResponseWithSecurity = function (options, cb) {
  options.headers = {
    "SECURITY-KEY": getMobileSecurityKey()
  };

  options.timeout = 10000;

  request(options, function (error, response, body) {
    if (error) {
      if (error.code === "ETIMEDOUT") {
        console.log("request timeout : " + JSON.stringify(options));
      }

      console.log("Error on request : " + JSON.stringify(error));
    }

    if (cb) {
      cb(error, response, body);
    }
  });
};

var convertToJsonObject = function (obj) {
  if (typeof obj == 'object') {
    obj = JSON.stringify(obj);
  }

  if (typeof obj == 'string') {
    obj = JSON.parse(obj);
  }

  return obj;
};

var stringToDate = function (date) {
  if (!__util.isNullOrEmpty(date)) {
    return (new Date(date));
  }

  return '';
};

module.exports = {
  "init": init,
  "encrypt": encrypt,
  "decrypt": decrypt,
  "getUrlResponseWithSecurity": getUrlResponseWithSecurity,
  "convertToJsonObject": convertToJsonObject,
  "stringToDate": stringToDate
};


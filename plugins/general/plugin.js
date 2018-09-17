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
  try {
    var decrypted = _decryptString(str, hexType, utfType);

    return decrypted;

  } catch (err) {
    $log.error("Error on decrypt: " + JSON.stringify(err));

    return str;
  }
};

var _cryptString = function (str, fromType, toType) {
  var cipher = crypto.createCipher('des-ede3-cbc', secretkey);
  var cryptedPassword = cipher.update(str, fromType, toType);
  cryptedPassword += cipher.final(toType);

  return cryptedPassword;
};

var _decryptString = function (str, fromType, toType) {
  var decipher = crypto.createDecipher('des-ede3-cbc', secretkey);
  var decryptedPassword = decipher.update(str, fromType, toType);
  decryptedPassword += decipher.final(toType);

  return decryptedPassword;
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

var setAvailableFrom = function (eventObj, tileId, dateTime, newActivate) {
  var checkDelayTile = false;
  var setActiveTileId;

  for (var i = 0; i < eventObj.tiles.length; i++) {
    var tile = eventObj.tiles[i];

    if (tile._id == tileId) {
      if (__util.isNullOrEmpty(tile.triggerdata.availableFrom) || (new Date(tile.triggerdata.availableFrom)) > (new Date())) {
        tile.triggerdata.availableFrom = dateTime.toUTCString().toLowerCase();
      } else {
        dateTime = (new Date(tile.triggerdata.availableFrom));
      }

      tile = _getDeActivateTime(eventObj, tile, dateTime, i, newActivate);

      if (tile.triggerdata.type == "manual" && tile.triggerdata.stopType == 'aftertile') {
        setActiveTileId = tileId;
      }

      if (tile.triggerdata.type == "manual" && tile.triggerdata.setActiveTileId) {
        var indx = i - 1;
        var prevTile = eventObj.tiles[indx];

        if (prevTile && prevTile.triggerdata.stopType == 'aftertile' && prevTile._id == tile.triggerdata.setActiveTileId) {
          delete tile.triggerdata["setActiveTileId"];

          if (!__util.isNullOrEmpty(prevTile.triggerdata.delayToDeActivate)) {
            var getDeactivatedTime = new Date();
            getDeactivatedTime.setTime(dateTime.getTime());
            getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(prevTile.triggerdata.delayToDeActivate));
            prevTile.triggerdata.deactivatedTime = getDeactivatedTime.toUTCString().toLowerCase();

            eventObj.tiles[indx] = prevTile;
          }
        }
      }

      checkDelayTile = true;
      continue;
    }

    if (checkDelayTile) {
      if (tile.triggerdata.type == "delay") {
        //if(__util.isNullOrEmpty(tile.triggerdata.availableFrom) || (new Date(tile.triggerdata.availableFrom)) > (new Date())){
        dateTime.setMinutes(dateTime.getMinutes() + parseInt(tile.triggerdata.delayToActivate));
        tile.triggerdata.availableFrom = dateTime.toUTCString().toLowerCase();
        //}

        tile = _getDeActivateTime(eventObj, tile, dateTime, i);
      } else if (tile.triggerdata.type == "manual" && !__util.isNullOrEmpty(setActiveTileId)) {
        if (__util.isNullOrEmpty(tile.triggerdata.availableFrom)) {
          tile.triggerdata.setActiveTileId = setActiveTileId;
        } else {
          var indx = i - 1;
          var prevTile = eventObj.tiles[indx];

          if (!__util.isNullOrEmpty(prevTile.triggerdata.delayToDeActivate)) {
            var getDeactivatedTime = new Date();
            var tileAvailableFrom = stringToDate(tile.triggerdata.availableFrom);
            getDeactivatedTime.setTime(tileAvailableFrom.getTime());
            getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(prevTile.triggerdata.delayToDeActivate));

            if ((new Date(prevTile.triggerdata.availableFrom)) < getDeactivatedTime) {
              prevTile.triggerdata.deactivatedTime = getDeactivatedTime.toUTCString().toLowerCase();
            } else {
              delete tile.triggerdata["stopType"];
              delete tile.triggerdata["delayToDeActivate"];
            }

            eventObj.tiles[indx] = prevTile;
          }
        }

        break;
      } else {
        break;
      }
    }
  }

  return eventObj;
};

var _getDeActivateTime = function (eventObj, tile, dateTime, indx, newActivate) {
  var getDeactivatedTime = new Date();

  if (!__util.isNullOrEmpty(tile.triggerdata.stopType)) {
    if (tile.triggerdata.stopType == 'aftertrigger' && !__util.isNullOrEmpty(tile.triggerdata.delayToDeActivate)) {
      getDeactivatedTime.setTime(dateTime.getTime());
      getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(tile.triggerdata.delayToDeActivate));
      tile.triggerdata.deactivatedTime = getDeactivatedTime.toUTCString().toLowerCase();
    } else if (tile.triggerdata.stopType == 'aftertile' && !__util.isNullOrEmpty(tile.triggerdata.delayToDeActivate)) {
      var nextTile = eventObj.tiles[parseInt(indx) + 1];

      if (nextTile) {
        if (nextTile.triggerdata.type == "delay") {
          getDeactivatedTime.setTime(dateTime.getTime());
          getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(nextTile.triggerdata.delayToActivate));
          getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(tile.triggerdata.delayToDeActivate));
          tile.triggerdata.deactivatedTime = getDeactivatedTime.toUTCString().toLowerCase();
        } else if (nextTile.triggerdata.type == "time") {
          getDeactivatedTime.setTime((stringToDate(nextTile.triggerdata.availableFrom ? nextTile.triggerdata.availableFrom : nextTile.triggerdata.timeToActivate).getTime()));
          getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(tile.triggerdata.delayToDeActivate));
          tile.triggerdata.deactivatedTime = getDeactivatedTime.toUTCString().toLowerCase();
        } else if (nextTile.triggerdata.type == "manual" && !__util.isNullOrEmpty(nextTile.triggerdata.availableFrom)) {
          getDeactivatedTime.setTime(stringToDate(nextTile.triggerdata.availableFrom).getTime());
          getDeactivatedTime.setMinutes(getDeactivatedTime.getMinutes() + parseInt(tile.triggerdata.delayToDeActivate));
          tile.triggerdata.deactivatedTime = getDeactivatedTime.toUTCString().toLowerCase();
        }
      }
    } else if (tile.triggerdata.stopType == 'time' && !__util.isNullOrEmpty(tile.triggerdata.timeToDeActivate)) {
      tile.triggerdata.deactivatedTime = stringToDate(tile.triggerdata.timeToDeActivate).toUTCString().toLowerCase();
    }

    if (!newActivate && __util.isNullOrEmpty(tile.triggerdata.deactivatedTime) || (new Date(tile.triggerdata.availableFrom)) > (new Date(tile.triggerdata.deactivatedTime))) {
      delete tile.triggerdata["stopType"];
      delete tile.triggerdata["deactivatedTime"];
      delete tile.triggerdata["delayToDeActivate"];
      delete tile.triggerdata["timeToDeActivate"];
    }
  }

  return tile;
};

var getIsoDate = function () {
  var isoString = new Date().toISOString();
  var isoDate = new Date(isoString);

  return isoDate;
};

var getDynamicPin = function () {
  var str = '';

  for (var i = 0; i < 6; i++) {
    str += Math.floor(Math.random() * 7) + 1;
  }

  var randnum = parseInt(str, 10);

  return randnum;
};

var getObjectIdByQuery = function (memberObj) {
  if (!__util.isNullOrEmpty(memberObj.appId)) {
    memberObj.appId = $db.objectId(memberObj.appId);
  }

  if (!__util.isNullOrEmpty(memberObj.locationId)) {
    memberObj.locationId = $db.objectId(memberObj.locationId);
  }

  if (!__util.isNullOrEmpty(memberObj.memberId)) {
    memberObj.memberId = $db.objectId(memberObj.memberId);
  }

  if (!__util.isNullOrEmpty(memberObj.tileId)) {
    memberObj.tileId = $db.objectId(memberObj.tileId);
  }

  if (!__util.isNullOrEmpty(memberObj.tileBlockId)) {
    memberObj.tileBlockId = $db.objectId(memberObj.tileBlockId);
  }

  if (!__util.isNullOrEmpty(memberObj.procedureMappingId) && memberObj.procedureMappingId != "0") {
    memberObj.procedureMappingId = $db.objectId(memberObj.procedureMappingId);
  }

  return memberObj;
};

var profileDynamicFields = function (url, cb) {
  var options = {
    url: url,
    method: "GET"
  };

  getUrlResponseWithSecurity(options, function (err, res, body) {
    if (err) {
      $log.error("procedure add patient fields request: " + JSON.stringify(err));

      cb({});
      return;
    }

    if (res.statusCode == 502) {
      cb({});

    } else if (res.statusCode == 200) {
      var fieldData = JSON.parse(body);
      cb(fieldData);
    }
  });
};

var getProfileHtml = function (fields, enableResetPassword) {
  var defaultRegex = {
    text: {
      pattern: "^[a-zA-Z0-9 \_\.]+$",
      message: " can only consist of alphabetical, number, dot and underscore"
    },
    email: {
      pattern: "",
      message: "Invalid email address"
    },
    date: {
      pattern: "",
      message: "Invalid Date of birth (mm/dd/yyyy)"
    },
    number: {
      pattern: "^[0-9 \.\,]+$",
      message: " can only consist of numbers with dot or commas"
    }
  };

  var html = "";

  _.each(fields, function (field) {
    if (field.tag === "password" && enableResetPassword) {
      html += "<div class='form-group' type='" + field.type + "' tag='" + field.tag + "' style='position: relative;' role='" + field.role + "'>";

    } else {
      html += "<div class='form-group' type='" + field.type + "' tag='" + field.tag + "' role='" + field.role + "'>";
    }

    if (field.type === "check") {
      html += "<input style='float: left;margin-bottom: 15px;' type='checkbox' value='' id='" + field.tag + "' name='" + field.tag + "' ";

      if (!field.required) {
        html += "required data-bv-notempty-message='" + field.name + " is required' ";
      }

      html += "><span style='float: left;margin-left: 5px;margin-right: 10px;line-height: 20px;'>" + field.name + "</span>";

    } else if (field.type === "select") {
      var cssSeletedOptionAlert = "";
      html += "<select id='" + field.tag + "' name='" + field.tag + "'  ";

      var validationExists = _.filter(field.values, function (obj) {
        return !__util.isNullOrEmpty(obj.validation);
      });

      if (!__util.isEmptyObject(validationExists)) {
        cssSeletedOptionAlert = "selected-option-alert";
      }

      if (field.required) {
        html += "required data-bv-notempty-message='" + field.name + " is required' class='form-control input-sm mandatory " + cssSeletedOptionAlert + "'>";

      } else {
        html += "class='form-control input-sm " + cssSeletedOptionAlert + "'>";
      }

      html += "<option value=''>" + (field.required ? ("*" + field.name) : field.name) + "</option>";

      _.each(field.values, function (optionObj) {
        html += "<option value='" + optionObj.value + "' ";

        if (!__util.isNullOrEmpty(optionObj.validation)) {
          html += "profile-message='" + optionObj.validation + "' ";
        }

        html += ">" + optionObj.value + "</option>";
      });

      html += "</select>";

    } else {
      html += "<input type='" + (field.tag === "password" ? "password" : (field.type === "date" ? "text" : field.type)) + "' ";
      html += "id='" + field.tag + "' name='" + field.tag + "' ";

      if (field.required) {
        html += "required data-bv-notempty-message='" + field.name + " is required' ";

        if (field.type === "date") {
          html += "class='form-control input-sm type-date mandatory' placeholder='" + field.name + " (mm/dd/yyyy)' ";

        } else {
          html += "class='form-control input-sm mandatory' placeholder='* " + field.name + "' ";
        }

      } else {
        if (field.type === "date") {
          html += "class='form-control input-sm type-date' placeholder='" + field.name + " (mm/dd/yyyy)' ";

        } else {
          html += "class='form-control input-sm' placeholder='" + field.name + "' ";
        }
      }

      if (field.type === "number") {
        html += "pattern='" + defaultRegex[field.type].pattern + "' ";
        html += "data-bv-regexp='true' data-bv-regexp-message='" + field.name + defaultRegex[field.type].message + "' ";

      } else if (field.type === "email") {
        html += "data-bv-emailaddress='true' data-bv-emailaddress-message='" + defaultRegex[field.type].message + "' ";

      } else if (field.type === "date") {
        html += "data-bv-date-format='MM/DD/YYYY' ";
        html += "data-bv-date='true' data-bv-date-message='" + defaultRegex[field.type].message + "' ";

      } else if (field.type === "custom") {
        html += "pattern='" + field.regex + "' ";
        html += "data-bv-regexp='true' data-bv-regexp-message='" + field.name + " is invalid' ";
      }

      if (field.tag === "password" && enableResetPassword) {
        html += " style='width: 470px;' readonly ";
      }

      html += ">";

      if (field.tag === "password" && enableResetPassword) {
        html += "<button id='btnPasswordReset' class='btn btn-default btn-xs'> Reset </button> ";
        html += "<span style='font-size: 10px; color: #6b6b6b;'> Password is generated automatically </span> ";
      }
    }

    html += "</div>";
  });

  return html;
};

var validateEmail = function (email) {
  if (!__util.isNullOrEmpty(email)) {
    var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
    return regex.test(email);
  }

  return false;
};

var hashMD5 = function (str) {
  return crypto.createHash('md5').update(str).digest('hex');
};

module.exports = {
  "init": init,
  "encrypt": encrypt,
  "decrypt": decrypt,
  "getUrlResponseWithSecurity": getUrlResponseWithSecurity,
  "convertToJsonObject": convertToJsonObject,
  "setAvailableFrom": setAvailableFrom,
  "_getDeActivateTime": _getDeActivateTime,
  "stringToDate": stringToDate,
  "getIsoDate": getIsoDate,
  "getDynamicPin": getDynamicPin,
  "getObjectIdByQuery": getObjectIdByQuery,
  "profileDynamicFields": profileDynamicFields,
  "getProfileHtml": getProfileHtml,
  "validateEmail": validateEmail,
  "hashMD5": hashMD5
};


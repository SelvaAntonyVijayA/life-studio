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
  "getDynamicPin": getDynamicPin
};


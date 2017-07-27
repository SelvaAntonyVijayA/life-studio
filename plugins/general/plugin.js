var crypto = require('crypto');
var mongoose = require('mongoose');
var hexType = 'hex';
var utfType = 'utf8';

var convertToObjectId = function (data) {
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
};

var _cryptString = function (str, fromType, toType) {
  var secretkey = "m@tsya@0!#";
  var cipher = crypto.createCipher('des-ede3-cbc', secretkey);
  var cryptedPassword = cipher.update(str, fromType, toType);
  cryptedPassword += cipher.final(toType);

  return cryptedPassword;
};

module.exports = {
  init: function () {

  },
  encrypt: function (str) {
    var encrypted = _cryptString(str, utfType, hexType);

    return encrypted;
  },

  decrypt: function (str) {
    var decrypted = _cryptString(str, hexType, utfType);

    return decrypted;
  },

  convertToObjectId: convertToObjectId
};


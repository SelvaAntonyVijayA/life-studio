var crypto = require('crypto');
var hexType = 'hex';
var utfType = 'utf8';

module.exports = {
  init : function(){

  },
  encrypt: function (str) {
    var encrypted = _cryptString(str, utfType, hexType);

    return encrypted;
  },

  decrypt: function (str) {
    var decrypted = _cryptString(str, hexType, utfType);
    
    return decrypted;
  }
};

var _cryptString = function (str, fromType, toType) {
  var secretkey = "m@tsya@0!#";
  var cipher = crypto.createCipher('des-ede3-cbc', secretkey);
  var cryptedPassword = cipher.update(str, fromType, toType);
  cryptedPassword += cipher.final(toType);

  return cryptedPassword;
};
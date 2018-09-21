var jwt = require("jsonwebtoken");
var secretKey = "b4083c7032a419bb4a84ce53426c6bbe";

var generate = function (data) {
  var options = {};
  /*
  var options = {
    expiresIn : '24h'
  };*/

  var token = jwt.sign(data, secretKey, options);

  return token;
};

var get = function (token) {
  var options = {};

  var obj = jwt.verify(token, secretKey, options);

  return obj;
};

var verify = function (token, cb) {
  var resdata = {
    success: false
  };

  jwt.verify(token, secretKey, function (err, decoded) {
    if (err) {
      console.dir(err);

    } else {
      resdata.success = true;
      resdata.decoded = decoded;
    }

    cb(resdata);
  });
};

var refresh = function (token, cb) {
  jwt.verify(token, secretKey, function (err, data) {
    if (err) {
      cb(err);
    }

    if (user.id) {
      cb({
        newToken: jwt.issue({
          _id: data._id
        })
      });
    }
  });
};

module.exports = {
  "get": get,
  "verify": verify,
  "refresh": refresh,
  "generate": generate
};

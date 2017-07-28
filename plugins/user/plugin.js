var path = require("path");

var user = require(path.join(process.cwd(), 'models', 'user'));
var query = {};

var init = function (req, res, next) {
  console.log("ILI Itialized");
};

var getLogin = function (req, res, next) {
  res.render('index.html');
};

var login = function (req, res, next) {
  var obj = req.body.form_data;

  query = {};
  query.email = obj.email.toLowerCase();
  query.password = $general.encrypt(obj.password);

  user.find(query, {}, { lean: true }, function (err, user) {
    var mainResult = { "userfound": false };

    if (user && user.length > 0) {
      mainResult.userfound = true;
      var cookie = req.cookies.cookieName;

      try {
        $async.waterfall([
          function (callback) {
            if (user && user.length > 0) {
              $async.parallel({
                organizations: function (cb) {
                  $organization.getList({
                    _id: { $in: user[0].organizationId }
                  }, {}, function (result) {
                    cb(null, result);
                  });
                },
                role: function (cb) {
                  $role._get({
                    _id: { $in: $general.convertToObjectId(user[0].role_id) }
                  }, {}, function (result) {
                    cb(null, result);
                  });
                }
              }, function (err, result) {
                callback(null, user, result);
              });
            } else {
              callback(null, []);
            }
          }], function (err, userResult, result) {
            var userObj = {};

            userObj.name = userResult[0].name;
            userObj.email = userResult[0].email;
            userObj.isAdmin = userResult[0].isAdmin;
            userObj.pin = userResult[0].pin;
            userObj.roleId = !__util.isNullOrEmpty(userResult[0].role_id) ? userResult[0].role_id : "";
            userObj.role = result.role[0];

            var tokenJSON = {
              uid: userResult[0]._id,
              user: userObj
            };

            var token = $authtoken.generate(tokenJSON);
            res.cookie('token', token);
            res.send(mainResult);
          });
      } catch (e) {
        res.send(mainResult);
      }
    } else {
      res.send(mainResult);
    }

  });
};

var get = function (req, res, next) {
  var obj = $authtoken.get(req.cookies.token);
  var uid = obj.uid;
  query = { "_id": uid };

  user.find(query, {}, { lean: true }, function (err, result) {
    if (result.length > 0) {
      $organization.getList({ _id: { $in: result[0].organizationId } }, {}, function (orgs) {
        result[0].organizations = orgs;
        res.send(result);
      });
    } else {
      res.send([]);
    }
  });
};

var getsession = function (req, res, next) {
  var obj = $authtoken.get(req.cookies.token);
  
  res.send({
    name: obj.user.name,
    pin: obj.user.pin,
    email: obj.user.email,
    roleId: obj.user.roleId,
    role: {
      name: obj.user.isAdmin && obj.user.role.name.toLowerCase() == 'ili' ? "iliadmin" : obj.user.role.name.toLowerCase(),
      level: obj.user.role.level
    }
  });
};

module.exports = {
  "init": init,
  "login": login,
  "getLogin": getLogin,
  "login": login,
  "get": get,
  "getsession": getsession
};
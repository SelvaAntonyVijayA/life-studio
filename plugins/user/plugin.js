var path = require("path");

var login = require(path.join(process.cwd(), 'models', 'login'));
var query = {};

exports.init = function (req, res, next) {
  console.log("ILI Itialized");
};

exports.getLogin = function (req, res, next) {
  res.render('index.html');
};

exports.login = function (req, res, next) {

  console.dir(req);
  var obj = req.body.form_data;

  query = {};
  query.email = obj.email.toLowerCase();
  query.password = $general.encrypt(obj.password);

  login.find(query, {}, { lean: true }, function (err, user) {
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

            var tokenJSON = {
              uid: userResult[0]._id,
              user: user
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
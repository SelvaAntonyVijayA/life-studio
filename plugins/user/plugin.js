var path = require("path");

var login = require(path.join(process.cwd(), 'models', 'login'));
var query = {};

exports.init = function (req, res, next) {
  console.log("ILI Itialized");
};

exports.getLogin = function (req, res, next) {
  res.render('index.html');
};

exports.userAuthenticate = function (req, res, next) {
  var obj = JSON.parse(req.body.form_data);
  query = {};

  query.email = obj.email.toLowerCase();
  query.password = $general.encrypt(obj.password);

  login.find(query, function (err, result) {
    if (err) {
      res.send(err);
    }

    res.send(result);
  });
};
var path = require("path");

var options = {};
var query = {};

var role = require(path.join(process.cwd(), 'models', 'role'));

var init = function () {

};

var _get = function (query, options, cb) {
  options.lean = true;

  role.find(query, {}, options, function (err, result) {
    cb(result);
  });
};

module.exports = { "init": init, "_get": _get };
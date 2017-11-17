var path = require("path");
var mongoose = require('mongoose');
var options = {};
var query = {};

var page = require(path.join(process.cwd(), 'models', 'page'));

var isRoleGroup = function (rQuery, rOpts, cb) {
  rOpts.lean = true;

  page.find(rQuery, {}, rOpts, function (err, result) {
    cb(result);
  });
};

module.exports = { "isRoleGroup": isRoleGroup };

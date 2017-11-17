var path = require("path");
var mongoose = require('mongoose');

var organization = require(path.join(process.cwd(), 'models', 'organization'));

var getList = function (query, options, cb) {
  options.sort = {'name': 1};
  options.lean = true;

  organization.find(query, {}, options, function (err, result) {
    cb(result);
  });
};


module.exports = {"getList": getList };


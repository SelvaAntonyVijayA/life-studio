var path = require("path");
var mongoose = require('mongoose');
var options = {};
var query = {};

var tileCategory = require(path.join(process.cwd(), 'models', 'tilecategory'));

var get = function (req, res, next) {
  query = {};
  options = {};
  options.lean = true;
  options.sort = { "name": 1 };
  query.organizationId = req.params.orgId;

  tileCategory.find(query, {}, options, function (err, result) {
    res.send(result);
  });
};

module.exports = {
  "get": get
};


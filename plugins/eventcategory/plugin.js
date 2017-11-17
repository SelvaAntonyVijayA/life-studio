var path = require("path");
var mongoose = require('mongoose');
var options = {};
var query = {};

var eventCategory = require(path.join(process.cwd(), 'models', 'eventcategory'));

var list = function (req, res, next) {
  query = {};
  options = {};
  options.sort = { "name": 1};
  options.lean = true; 
  query.organizationId = !__util.isNullOrEmpty(req.params.orgId) ? req.params.orgId : "-1";

  eventCategory.find(query, {}, options, function (err, evtCategories) {
    res.send(evtCategories);
  });
};


module.exports = {
  "list": list
};


var path = require("path");
var mongoose = require('mongoose');
var query = {};
var options = {};

var domains = require(path.join(process.cwd(), 'models', 'domains'));

var init = function () {

};

var get = function (req, res, next) {
  var domainName = req.body.domainName;
  query = { "name": domainName };
  options = { 'lean': true };

  domains.find(query, {}, options, function (err, result) {
    if (err) {
      res.send(err);
    }
     
    res.send(result);
  });
};

module.exports = { "init": init, "get": get };
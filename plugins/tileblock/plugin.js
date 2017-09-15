var path = require("path");
var mongoose = require('mongoose');
var options = {};
var query = {};

var tileBlock = require(path.join(process.cwd(), 'models', 'tileblock'));

var init = function () {
};

var get = function (req, res, next) {
  options.lean = true;

  query = { "_id": { $in: req.body.blockIds } };

  console.dir(query);

  tileBlock.find(query, {}, options, function (err, result) {
    console.dir(result);
    res.send(result);
  });
};

module.exports = { "init": init, "get": get };
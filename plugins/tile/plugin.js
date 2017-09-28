var path = require("path");
var mongoose = require('mongoose');
var options = {};
var query = {};

var tile = require(path.join(process.cwd(), 'models', 'tile'));

var init = function () {
};

var list = function (req, res, next) {
  options.sort = { 'lastUpdatedOn': -1 };
  options.lean = true;

  query = { "appSettings": { "$nin": [true] } };
  query["organizationId"] = req.body.organizationId;

  tile.find(query, {"blocksData": 0}, options, function (err, result) {
    res.send(result);
  });
};

module.exports = { "init": init, "list": list };
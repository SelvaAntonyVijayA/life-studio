var path = require("path");
var mongoose = require('mongoose');
var options = {};
var query = {};

var tileBlock = require(path.join(process.cwd(), 'models', 'tileblock'));

var get = function (req, res, next) {
  options.lean = true;
  query = { "_id": { $in: req.body.blockIds } };

  tileBlock.find(query, {}, options, function (err, result) {
    res.send(result);
  });
};

var getProfile = function (req, res, next) {
  var orgId = req.params.orgId;
  var eventId = (!__util.isNullOrEmpty(req.params.eventId) ? req.params.eventId : "");
  console.log(eventId);
  var language = (!__util.isNullOrEmpty(req.params.language) ? req.params.language : "en");
  var authDomain = req.app.get('settings').authDomain;

  var url = authDomain + '/migrate/get_org_structure/' + orgId + '/' + language;

  var options = {
    url: url,
    method: "GET"
  };

  $general.getUrlResponseWithSecurity(options, function (error, response, body) {
    if (error) {
      console.log(error);
    }

    var urlResult = (!error && response.statusCode == 200) ? body : [];
    res.send(urlResult);
  });
};

module.exports = {
  "get": get,
  "getProfile": getProfile
};
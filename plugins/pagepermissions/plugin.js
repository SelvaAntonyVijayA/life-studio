var settingsConf;
var query = {};
var options = {};

var init = function (app) {
  settingsConf = app.get('settings');
};

var updatePageDate = function(pageQuery) {
  options = {
    "multi" : true
  };

  var pageData = {
    "dateUpdated" : (new Date((new Date()).toUTCString()))
  };

  $page._update(pageQuery, options, pageData, function(result) {
  });
};

module.exports = {
  "init": init,
  "updatePageDate": updatePageDate
};

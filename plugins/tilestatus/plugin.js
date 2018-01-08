var settingsConf;
var options = {};
var query = {};

//var tile = require(path.join(process.cwd(), 'models', 'tile'));
var init = function (app) {
  settingsConf = app.get('settings');
};

var saveHsrByOrg = function (orgId, cb) {
  status.saveHsrStatus(settingsConf, orgId, function (result) {
    var hsrResult = result ? "Saved" : "Not Saved";

    if (cb) {
      cb(result);
    }
  });
}

module.exports = {
  "init": init,
  "saveHsrByOrg": saveHsrByOrg
}
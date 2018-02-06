var fs = require("fs");
var d = ' :: ';
var conf;

var init = function (app) {
  var settingsConf = app.get('settings');
   
  if (!settingsConf.hasOwnProperty("log") || __util.isEmptyObject(settingsConf["log"])) {
    console.log('Did not find the log configuration. Setting defaults.');
    conf = {};
    conf.all = true;
  }else{
    conf = settingsConf["log"];
  }
};

var critical = function (str) {
  if (conf.all || conf.critical) {
    _log('Critical Error' + d + str);
  }
};

var error = function (str) {
  if (conf.all || conf.error) {
    _log('Error' + d + str);
  }
};

var warn = function (str) {
  if (conf.all || conf.warn) {
    _log('Warning' + d + str);
  }
};

var info = function (str) {
  if (conf.all || conf.info) {
    _log('Info' + d + str);
  }
};

var debug = function (str) {
  if (conf.all || conf.debug) {
    _log('Debug' + d + str);
  }
};

var _log = function (str) {
  if (conf.store == 'files') {
    _writeinfilelog(str);
  } else {
    console.log((new Date()).toString() + d + 'str');
  }
};

var _writeinfilelog = function (str) {
  newline = "\r\n";
  str = (new Date()).toString() + d + str + newline;
  fs.appendFile(conf.filepath, str, function (err) {
    if (err) throw err;
  });
};

module.exports = {
  "init": init,
  "critical": critical,
  "error": error,
  "warn": warn,
  "info": info,
  "debug": debug
};

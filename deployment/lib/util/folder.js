var path = require('path');
var fs = require('fs');

var getValid = function (folder) {
  if (!__util.strEndsWith(folder, path.sep)) {
    folder = folder + path.sep;
  }
  if (_isValid(folder)) {
    return folder;
  }
  return null;
};

var isValid = function (folder) {
  return _isValid(folder);
};

var createIfNot = function (folderPath) {
  if (!_isValid(folderPath)) {
    fs.mkdirSync(folderPath);
  }
};

var _isValid = function (folder) {
  return fs.existsSync(folder);
};

module.exports = {
  "getValid": getValid,
  "isValid": isValid,
  "createIfNot": createIfNot
};

var fs = require('fs');

var isValid = function (path) {
  return _isValid(path);
};

var filePath = function (path, file) {
  return _filePath(path, file);
};

var upload = function (file, targetPath, cb) {
  var is = fs.createReadStream(file.path);
  var os = fs.createWriteStream(targetPath);

  is.pipe(os);
  is.on('end', function () {
    cb();
  });
};

var encodeUpload = function (file, targetPath, cb) {
  fs.readFile(file.path, function (err, base64Image) {
    var decodeImage = new Buffer(base64Image, 'base64').toString('binary');

    fs.writeFile(targetPath, decodeImage, 'base64', function (err) {
      if (err) {
        console.log(err);
        cb(err);
      }

      cb(null);
    });
  });
};

var uploadSync = function (file, targetPath) {
  fs.renameSync(file.path, targetPath);
};

var _filePath = function (path, file) {
  path = __util.validPath(path);
  var filePath = path + file;
  if (_isValid(filePath)) {
    return filePath;
  }
  return null;
};

var _isValid = function (path) {
  return fs.existsSync(path);
};

module.exports = {
  "isValid": isValid,
  "filePath": filePath,
  "upload": upload,
  "encodeUpload": encodeUpload,
  "uploadSync": uploadSync
};


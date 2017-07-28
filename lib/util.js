var args = require('./util/args.js');
var str = require('./util/str.js');
var obj = require('./util/obj.js');
var file = require('./util/file.js');
var folder = require('./util/folder.js');

console.dir(args);

//Object functions
var isValidObject = function (item) { return obj.isValid(item); };
var objectType = function (item) { return obj.getType(item); };
var isEmptyObject = function (item) { return obj.isEmpty(item); };

//String functions
var strEndsWith = function (target, search) { return str.endsWith(target, search); };
var isNullOrEmpty = function (target) { return str.isNullOrEmpty(target); };
var replaceEmpty = function (target) { return str.replaceEmpty(target); };

//file Functions
var isValidFile = function (filePath) { return file.isValid(filePath); };
var filePath = function (path, fileName) { return file.filePath(path, fileName); };
var fileUpload = function (uploadFile, targetPath, fileName, cb) {
  folder.createIfNot(targetPath);
  file.upload(uploadFile, targetPath + fileName, function (err) { if (err) { cb(err); } cb(); });
};
var fileUploadSync = function (uploadFile, targetPath, fileName) {
  folder.createIfNot(targetPath);
  file.uploadSync(uploadFile, targetPath + fileName);
};
var fileUploadEncode = function (encodeStr, targetPath, fileName, cb) {
  folder.createIfNot(targetPath);
  file.encodeUpload(encodeStr, targetPath + fileName, function (err) { if (err) { cb(err); } cb(); });
};

//folder functions
var validPath = function (path) { return folder.getValid(path); };
var isValidPath = function (path) { return folder.isValid(path); };
var createDir = function (path) { folder.createIfNot(path); };

module.exports = {
  "isValidObject": isValidObject,
  "objectType": objectType,
  "isEmptyObject": isEmptyObject,
  "strEndsWith": strEndsWith,
  "isNullOrEmpty": isNullOrEmpty,
  "replaceEmpty": replaceEmpty,
  "isValidFile": isValidFile,
  "filePath": filePath,
  "fileUpload": fileUpload,
  "fileUploadSync": fileUploadSync,
  "fileUploadEncode": fileUploadEncode
};
var imageConf, appConf, __appPath;
const fs = require('fs');
const path = require('path');
const easyImg = require('easyimage');
const util = require('util');

var init = function (app) {
  appConf = app.get('settings');
  imageConf = appConf["image"];
  __appPath = appConf["path"];
};

var list = function (req, res, next) {
  query = {};
  query.organizationId = req.params.orgId;

  var rootFolder = __appPath + imageConf.imgfolderpath.replace('{0}', query.organizationId);
  var imageUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', query.organizationId);

  if (!__util.isNullOrEmpty(req.params.folder)) {
    query.folder = req.params.folder;
    rootFolder = __appPath + imageConf.imgfolderpath.replace('{0}', query.organizationId) + query.folder + "/";
    imageUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', query.organizationId) + query.folder + "/";
  }

  if (__util.isValidPath(rootFolder) && !__util.isNullOrEmpty(query.organizationId)) {
    fs.readdir(rootFolder, function (err, files) {
      if (err) {
        $log.error('image list: ' + err);
      }

      var imageList = [];

      _.each(files, function (file) {
        try {
          stats = fs.lstatSync(rootFolder + file);

          if (stats.isFile()) {
            imageList.push(imageUrl + file);
          }
        } catch (e) {
          $log.error('image list error: ' + query.organizationId);
        }
      });

      res.send(imageList);
    });
  } else {
    res.send([]);
  }
};

var upload = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };
  var type = req.data.type;
  var isEncoded = typeof req.data.isEncoded == 'undefined' || req.data.isEncoded == "false" ? false : true;

  _uploadImage(context, type, isEncoded);
};

var uploadImage = function (req, res, next) {
  var postData = req.data.jsonPayload;
  var type = postData.type;
  var isEncoded = typeof req.data.isEncoded == 'undefined' || req.data.isEncoded == "false" ? false : true;
  var context = { "req": req, "res": res, "next": next };

  if (type == "tilephoto") {
    _uploadTileImage(context, isEncoded);
  } else if (type == "formphoto" || type == "eventphoto") {
    _photoUpload(context, isEncoded);
  } else if (type == "categoryphoto") {
    _uploadImage(context, type, isEncoded);
  } else if (type == "profilephoto") {
    _profilePictureUpload(context, isEncoded);
  } else if (type == "drawtool") {
    _drawImageUpload(context, isEncoded);
  } else if (type == "blanksform") {
    _blankFormImageUpload(context, isEncoded);
  } else {
    _uploadImage(context, type, isEncoded);
  }
};

var uploadTileImage = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _uploadTileImage(context, false);
};

var uploadDecodedTileImage = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _uploadTileImage(context, true);
};

var resize = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  $async.waterfall([
    function (callback) {
      var options = _resizeOptions(context);

      if (options.height === 0 && __util.isValidFile(options.src)) {
        easyImg.info(options.src, function (err, stdout, stderr) {
          if (err) {
            $log.error('URL resize image info: ' + err);

            callback(null, options, true);
          } else {
            options.height = parseInt((stdout.height / stdout.width) * options.width);
            var returnOriginalImage = (stdout.width < options.width);

            callback(null, options, returnOriginalImage);
          }
        });
      } else {
        callback(null, options, false);
      }
    }], function (err, options, returnOriginalImage) {
      if (__util.isValidFile(options.src)) {
        if (!returnOriginalImage) {
          options.height = options.height.toString() + "!";

          easyImg.resize(options, function (err, image) {
            if (err) {
              $log.error('image resize: ' + err);

              res.send({ "status": "Not Found" });
              return;
            }

            options.dst = options.dst.replace(/"/gi, "");

            $view.static(context, options.dst);
          });
        } else {
          $view.static(context, options.src);
        }
      } else {
        res.send({ "status": "Not Found" });
        return;
      }
    });
};

var crop = function (req, res, next) {
  var dstFileName = '';
  var obj = req.body.form_data;
  var context = { "req": req, "res": res, "next": next };
  var fileName = obj.src.split('/').pop();
  var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookie.oid);

  imagePath = !__util.isNullOrEmpty(obj.folder) ? imagePath + obj.folder + "/" : imagePath;

  if (!__util.isNullOrEmpty(obj.folder) && obj.folder == "stream") {
    var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', obj._id);
  }

  if (!__util.isNullOrEmpty(obj.folder) && obj.folder == "stream_crown") {
    var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', obj._id);

    imagePath = imagePath + "crown/";
  }

  var src = imagePath + fileName;
  var extension = "." + fileName.split('.').pop();

  if (obj.uploadedImage) {
    dstFileName = fileName.replace(extension, '') + extension;
  } else {
    dstFileName = fileName.replace(extension, '') + Date.parse(new Date()) + extension;
  }

  var dst = imagePath + dstFileName;

  easyImg.crop({
    src: src,
    dst: dst,
    cropwidth: obj.w,
    cropheight: obj.h,
    x: obj.x,
    y: obj.y,
    gravity: 'NorthWest',
    quality: 100
  }, function (err, image) {
    if (err) {
      $log.error('image copping: ' + err);
      res.send({ "status": "Not Found" });
      return;
    }

    _resizeUploadedImage(context, dst, dstFileName, 'crop');
  });
};

var folder = function (req, res, next) {
  query = {};
  query.organizationId = req.params.orgId;

  var rootFolder = __appPath + imageConf.imgfolderpath.replace('{0}', query.organizationId);

  if (__util.isValidPath(rootFolder) && !__util.isNullOrEmpty(query.organizationId)) {
    var folderList = [];

    fs.readdir(rootFolder, function (err, files) {
      if (err) {
        $log.error('folder list: ' + err);
      }

      _.each(files, function (file) {
        try {
          stats = fs.lstatSync(__appPath + imageConf.imgfolderpath.replace('{0}', query.organizationId) + file);

          if (stats.isDirectory() && (file !== '.svn' && file !== 'categories')) {
            folderList.push(file);
          }
        } catch (e) {
          $log.error('folder list error: ' + err);
        }
      });

      res.send(folderList);
    });
  } else {
    res.send(folderList);
  }
};

var saveFolder = function (req, res, next) {
  var obj = req.body.form_data;
  var fileName = __appPath + imageConf.imgfolderpath.replace('{0}', obj.organizationId) + obj.name;

  console.dir(obj)
  console.dir(fileName)

  fs.exists(fileName, function (exists) {
    if (exists) {

      res.send({
        "status": false
      });

    } else {
      __util.createDir(fileName);

      res.send({
        "status": true
      });
    }
  });
};

var remove = function (req, res, next) {
  var obj = req.body.form_data;
  var isArray = obj.hasOwnProperty("src") && util.isArray(obj.src) ? true : false;

  if (isArray) {
    var resultArray = [];

    $async.each(obj.src, function (file, loop) {
      var fileName = file.split('/').pop();
      var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookie.oid);

      imagePath = !__util.isNullOrEmpty(obj.folder) ? imagePath + obj.folder + "/" : imagePath;
      var src = imagePath + fileName;

      _remove(src, function (result) {
        resultArray.push(result);
        loop();
      });
    }, function () {
      var finalResult = {
        "status": true,
        "statusList": resultArray
      }


      res.send(finalResult);
    });
  } else {
    var fileName = obj.src.split('/').pop();
    var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookie.oid);

    imagePath = !__util.isNullOrEmpty(obj.folder) ? imagePath + obj.folder + "/" : imagePath;
    var src = imagePath + fileName;

    _remove(src, function (result) {

      res.send(result);
    });
  }
};

var uploadBackgroundGroup = function (req, res, next) {
  var retrn = {};
  var fileName;

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];

        if (!__util.isNullOrEmpty(file.name)) {
          var pathCount = 0;
          var id = req.data._id;
          var group = req.data.group;
          var type = req.data.type;
          var pageFrom = req.data.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(req.data.pagefrom) ? req.data.pagefrom : "";

          var fileArray = file.name.split('.');
          var fileName = fileArray[0] + Date.parse(new Date());
          fileName = fileName.split("_");
          fileName = fileName[0].replace(/\s/g, "");
          fileName = !__util.isNullOrEmpty(pageFrom) && pageFrom == "web" ? fileName + "_" + "web" + "_" + type + "." + fileArray[1] : fileName + "_" + type + "." + fileArray[1];

          var imagePath = __appPath + imageConf.imgGroupFolderPath.replace('{0}', group);

          if (group == "groupdefault") {
            var groupFolder = imagePath.replace("{1}/", "");
            __util.createDir(groupFolder);
          }

          imagePath = imagePath.replace("{1}", id);

          var pathCreateLen = !__util.isNullOrEmpty(type) && type == "icon" ? 2 : 1;
          var i;

          for (i = 0; i < pathCreateLen; i++) {
            if (i === 1) {
              imagePath = imagePath + "icon" + "/";
            }

            __util.createDir(imagePath);
          }

          fileName = fileName.replace(/(\s)+/g, '_');

          __util.fileUpload(file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original image : ' + imagePath + ' Error: ' + error);
            }
          });

          var imagePathAssigned = appConf.domain + imageConf.imgGroupUrlPath.replace('{0}', group);
          imagePathAssigned = imagePathAssigned.replace("{1}", id);

          if (type === "icon") {
            imagePathAssigned = imagePathAssigned + "icon" + "/";
          }

          imagePathAssigned = imagePathAssigned + fileName;

          var urlRtrn = {};
          urlRtrn.imageUrl = imagePathAssigned;

          res.send(urlRtrn);
        }
      }
    } else {

      res.send(urlRtrn);
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);

    res.send({});
  }
};

var backgroundPatternUpload = function (req, res, next) {
  var retrn = {};
  var fileName;

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];

        if (!__util.isNullOrEmpty(file.name)) {
          var pathCount = 0;
          var appId = req.data.appId;
          var pageId = req.data.pageId;
          var type = req.data.type;
          var pageFrom = req.data.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(req.data.pagefrom) ? req.data.pagefrom : "";
          var fileArray = file.name.split('.');
          var fileName = fileArray[0] + Date.parse(new Date());
          fileName = fileName.split("_");
          fileName = fileName[0].replace(/\s/g, "");
          fileName = !__util.isNullOrEmpty(pageFrom) && pageFrom == "web" ? fileName + "_" + "web" + "_" + type + "." + fileArray[1] : fileName + "_" + type + "." + fileArray[1];
          var imagePath = __appPath + imageConf.imgBgFolderPath.replace('{0}', appId);
          var pathCreateLen = !__util.isNullOrEmpty(pageFrom) && pageFrom == "web" ? 3 : 2;

          for (var i = 0; i < pathCreateLen; i++) {
            if (i == 1) {
              imagePath = imagePath + pageId + "/";
            }

            if (i == 2) {
              imagePath = imagePath + "web" + "/";
            }

            __util.createDir(imagePath);
          }

          fileName = fileName.replace(/(\s)+/g, '_');

          __util.fileUpload(file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original image : ' + imagePath + ' Error: ' + error);
            }
          });

          var imagePathAssigned = appConf.domain + imageConf.imgAppUrlPath.replace('{0}', appId);
          imagePathAssigned = imagePathAssigned.replace("{1}", pageId);

          if (!__util.isNullOrEmpty(pageFrom) && pageFrom == "web") {
            imagePathAssigned = imagePathAssigned + "web" + "/" + fileName;
          } else {
            imagePathAssigned = imagePathAssigned + fileName;
          }


          var urlRtrn = {};
          urlRtrn.imageUrl = imagePathAssigned;

          res.send(urlRtrn);
        }
      }
    } else {
      res.send(retrn);
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);

    res.send({});
  }
};

var backgroundPatternRemove = function (req, res, next) {
  var obj = req.body.form_data;
  var pageFrom = obj.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(obj.pagefrom) ? obj.pagefrom : "";

  var imagePath = __appPath + imageConf.imgAppFolderPath.replace('{0}', obj.appId);
  imagePath = imagePath.replace('{1}', obj.pageId);

  if (!__util.isNullOrEmpty(pageFrom) && pageFrom == "web") {
    imagePath = imagePath + "web" + "/" + obj.name;
  } else {
    imagePath = imagePath + obj.name;
  }

  if (__util.isValidFile(imagePath)) {
    fs.unlink(imagePath, function (err) {
      if (err) {
        $log.error('image delete: ' + err);

        res.send({
          "status": false
        });
      }

      res.send({
        "status": true
      });
    });
  } else {
    res.send({ "status": "Not Found" });
    return;
  }
};

var backgroundPatternList = function (req, res, next) {
  var images = [];
  var obj = req.body.form_data;
  var pageFrom = obj.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(obj.pagefrom) ? obj.pagefrom : "";

  var rootFolderPath = __appPath + imageConf.imgAppFolderPath.replace('{0}', obj.appId);
  rootFolderPath = rootFolderPath.replace('{1}', obj.pageId);

  if (!__util.isNullOrEmpty(pageFrom) && pageFrom == "web") {
    rootFolderPath = rootFolderPath + "web" + "/";
  }

  var filePath = appConf.domain + imageConf.imgAppUrlPath.replace('{0}', obj.appId);
  filePath = filePath.replace('{1}', obj.pageId);

  if (!__util.isNullOrEmpty(pageFrom) && pageFrom == "web") {
    filePath = filePath + "web" + "/";
  }

  if (__util.isValidPath(rootFolderPath)) {
    fs.readdir(rootFolderPath, function (err, files) {
      if (err) {
        $log.error('image list: ' + err);
      }

      if (files.length > 0) {
        _.each(files, function (file) {
          var imgPath = filePath + file;
          var stats = fs.lstatSync(rootFolderPath + file);

          if (!stats.isDirectory()) {
            images.push(imgPath);
          }
        });
      }

      res.send(images);
    });
  } else {
    res.send([]);
  }
};

var bgGroupRemove = function (req, res, next) {
  var obj = req.body.form_data;
  var isGroupIcon = false;

  if (obj && obj.hasOwnProperty("groupIcon")) {
    isGroupIcon = true;
    delete obj["groupIcon"];
  }

  var pageFrom = obj.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(obj.pagefrom) ? obj.pagefrom : "";
  var imagePath = __appPath + imageConf.imgGroupFolderPath.replace('{0}', obj.group);
  imagePath = imagePath.replace('{1}', obj._id);

  if (isGroupIcon) {
    imagePath = imagePath + "icon" + "/";
  }

  if (!__util.isNullOrEmpty(pageFrom) && pageFrom == "web") {
    imagePath = imagePath + "web" + "/" + obj.name;
  } else {
    imagePath = imagePath + obj.name;
  }

  if (__util.isValidFile(imagePath)) {
    fs.unlink(imagePath, function (err) {
      if (err) {
        $log.error('image delete: ' + err);

        res.send({
          "status": false
        });
      }

      res.send({
        "status": true
      });
    });
  } else {
    res.send({ "status": "Not Found" });
    return;
  }
};

var bgGroupList = function (req, res, next) {
  var images = [];
  var obj = req.body.form_data;
  var isGroupIcon = false;

  if (obj && obj.hasOwnProperty("groupIcon")) {
    isGroupIcon = true;
    delete obj["groupIcon"];
  }

  var rootFolderPath = __appPath + imageConf.imgGroupFolderPath.replace('{0}', obj.group);
  rootFolderPath = rootFolderPath.replace('{1}', obj._id);
  var filePath = appConf.domain + imageConf.imgGroupUrlPath.replace('{0}', obj.group);
  filePath = filePath.replace('{1}', obj._id);

  if (isGroupIcon) {
    filePath = filePath + "icon" + "/";
    rootFolderPath = rootFolderPath + "icon" + "/";
  }

  if (__util.isValidPath(rootFolderPath)) {
    fs.readdir(rootFolderPath, function (err, files) {
      if (err) {
        $log.error('image list: ' + err);
      }

      if (files.length > 0) {
        _.each(files, function (file) {
          var stats = fs.lstatSync(rootFolderPath + file);

          if (!stats.isDirectory()) {
            var imgPath = filePath + file;
            images.push(imgPath);
          }
        });
      }

      res.send(images);
    });
  } else {
    res.send([]);
  }
};

var emoticonsUpload = function (req, res, next) {
  var retrn = {};
  var fileName;
  var id;

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];

        if (!__util.isNullOrEmpty(file.name)) {
          var imagePath = __appPath + imageConf.imgEmoticonsFolderPath.replace('{0}', req.cookie.oid);

          if (req.data.fileName) {
            fileName = __util.replaceEmpty(req.data.fileName);
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          if (req.data.id) {
            id = __util.replaceEmpty(req.data.id);
          }

          __util.createDir(imagePath);

          fileName = fileName.replace(/(\s)+/g, '_');
          var extension = "." + fileName.split('.').pop();

          var splitedName = fileName.split('.');
          fileName = (!__util.isNullOrEmpty(id) ? id : splitedName[0]) + Date.parse(new Date()) + extension;

          __util.fileUpload(file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original image : ' + imagePath + ' Error: ' + error);
            }
          });

          var pathUploaded = appConf.domain + imageConf.imgEmoticonsUrlPath.replace('{0}', req.cookie.oid) + fileName;

          var urlRtrn = {};
          urlRtrn.imageUrl = pathUploaded;

          res.send(urlRtrn);
        }
      }
    } else {
      res.send(retrn);
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);
    res.send({});
  }
};

var emoticonsList = function (req, res, next) {
  query = {};
  query.organizationId = req.params.orgId;

  var rootFolder = __appPath + imageConf.imgEmoticonsFolderPath.replace('{0}', req.cookie.oid);
  var imageUrl = appConf.domain + imageConf.imgEmoticonsUrlPath.replace('{0}', req.cookie.oid);

  if (__util.isValidPath(rootFolder) && !__util.isNullOrEmpty(query.organizationId)) {
    fs.readdir(rootFolder, function (err, files) {
      if (err) {
        $log.error('image list: ' + err);
      }

      var imageList = [];

      _.each(files, function (file) {
        try {
          stats = fs.lstatSync(rootFolder + file);

          if (stats.isFile()) {
            imageList.push(imageUrl + file);
          }
        } catch (e) {
          $log.error('image list error: ' + query.organizationId);
        }
      });

      res.send(imageList);
    });
  } else {
    res.send([]);
  }
};

var emoticonsDelete = function (req, res, next) {
  var obj = req.body.form_data;
  var imagePath = __appPath + imageConf.imgEmoticonsFolderPath.replace('{0}', req.params.orgId);
  imagePath = imagePath + obj.name;

  $async.waterfall([
    function (callback) {
      var query = {
        'organizationId': req.params.orgId,
        'emoticons.url': obj.url
      };

      $livestream.get(query, function (liveStreamData) {
        callback(null, liveStreamData);
      });
    }], function (error, streamSquare) {
      if (streamSquare.length > 0) {
        res.send({
          "status": false,
          "msg": 'Already in use in livestream.'
        });

        return;
      }

      if (__util.isValidFile(imagePath) && !__util.isNullOrEmpty(req.params.orgId)) {
        fs.unlink(imagePath, function (err) {
          if (err) {
            $log.error('image emoticons delete: ' + err);

            res.send({
              "status": false,
              "msg": 'Invalid request.'
            });
          }

          res.send({
            "status": true
          });
        });
      } else {
        res.send({ "status": "Not Found" });
        return;
      }
    });
};

var profieEncodeUpload = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _profilePictureUpload(context, true);
};

var profiePictureUpload = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _profilePictureUpload(context, false);
};

var formPhotoUpload = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _photoUpload(context, false);
};

var streamUpload = function (req, res, next) {
  var retrn = {};
  var fileName;
  var id;

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];

        if (req.data.id) {
          id = __util.replaceEmpty(req.data.id);
        }

        if (!__util.isNullOrEmpty(file.name)) {
          var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', id);

          if (req.data.fileName) {
            fileName = __util.replaceEmpty(req.data.fileName);
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          __util.createDir(imagePath);

          fileName = fileName.replace(/(\s)+/g, '_');
          var extension = "." + fileName.split('.').pop();

          var splitedName = fileName.split('.');
          fileName = (!__util.isNullOrEmpty(id) ? id : splitedName[0]) + Date.parse(new Date()) + extension;

          __util.fileUpload(file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original image : ' + imagePath + ' Error: ' + error);
            }
          });

          var pathUploaded = appConf.domain + imageConf.imgStreamUrlPath.replace('{0}', id) + fileName;

          var urlRtrn = {};
          urlRtrn.imageUrl = pathUploaded;

          res.send(urlRtrn);
        }
      }
    } else {
      res.send(retrn);
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);

    res.send({});
  }
};

var streamCrownUpload = function (req, res, next) {
  var retrn = {};
  var fileName;
  var id;

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];

        if (req.data.id) {
          id = __util.replaceEmpty(req.data.id);
        }

        if (!__util.isNullOrEmpty(file.name)) {
          var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', id);

          __util.createDir(imagePath);

          imagePath = imagePath + "crown/";

          if (req.data.fileName) {
            fileName = __util.replaceEmpty(req.data.fileName);
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          __util.createDir(imagePath);

          fileName = fileName.replace(/(\s)+/g, '_');
          var extension = "." + fileName.split('.').pop();

          var splitedName = fileName.split('.');
          fileName = (!__util.isNullOrEmpty(id) ? id : splitedName[0]) + Date.parse(new Date()) + extension;

          __util.fileUpload(file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original image : ' + imagePath + ' Error: ' + error);
            }
          });

          var pathUploaded = appConf.domain + imageConf.imgStreamCrownUrlPath.replace('{0}', id).replace('{1}', 'crown') + fileName;

          var urlRtrn = {};
          urlRtrn.imageUrl = pathUploaded;

          res.send(urlRtrn);
        }
      }
    } else {
      res.send(retrn);
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);
    res.send({});
  }
};

var streamList = function (req, res, next) {
  query = {};
  var obj = req.body.form_data;
  query.organizationId = req.params.orgId;

  var rootFolder = __appPath + imageConf.imgStreamFolerPath.replace('{0}', obj._id);
  var imageUrl = appConf.domain + imageConf.imgStreamUrlPath.replace('{0}', obj._id);

  if (__util.isValidPath(rootFolder) && !__util.isNullOrEmpty(obj._id)) {
    fs.readdir(rootFolder, function (err, files) {
      if (err) {
        $log.error('image list: ' + err);
      }

      var imageList = [];

      _.each(files, function (file) {
        try {
          stats = fs.lstatSync(rootFolder + file);

          if (stats.isFile()) {
            imageList.push(imageUrl + file);
          }
        } catch (e) {
          $log.error('stream icon list error: ' + obj._id);
        }
      });

      res.send(imageList);
    });
  } else {
    res.send([]);
  }
};

var urlList = function (req, res, next) {
  query = {};
  query.organizationId = req.params.orgId;

  var rootFolder = __appPath + imageConf.imgfolderpath.replace('{0}', query.organizationId) + "url/";
  var imageUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', query.organizationId) + "url/";

  if (__util.isValidPath(rootFolder) && !__util.isNullOrEmpty(query.organizationId)) {
    fs.readdir(rootFolder, function (err, files) {
      if (err) {
        $log.error('image list: ' + err);
      }

      var imageList = [];

      _.each(files, function (file) {
        try {
          stats = fs.lstatSync(rootFolder + file);

          if (stats.isFile()) {
            imageList.push(imageUrl + file);
          }
        } catch (e) {
          $log.error('image list error: ' + query.organizationId);
        }
      });

      res.send(imageList);
    });
  } else {
    res.send([]);
  }
};

var exclusiveFileUpload = function (req, res, next) {
  var folder = req.data.folder;

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];
        var imagePath = "";
        var fileName = "";

        if (req.data.fileName) {
          fileName = __util.replaceEmpty(req.data.fileName);
        } else {
          fileName = __util.replaceEmpty(file.name);
        }

        if (!__util.isNullOrEmpty(file.name)) {
          var extension = "." + fileName.split('.').pop();
          imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', folder);
          __util.createDir(imagePath);

          imagePath += 'url/';
          fileName = fileName.replace(extension, '') + Date.parse(new Date()) + extension;

          __util.createDir(imagePath);

          __util.fileUpload(file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original file : ' + imagePath + ' Error: ' + error);
            }
          });

          var urlRtrn = {};
          urlRtrn.imageUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', folder) + 'url/' + fileName;

          res.send(urlRtrn);
        }
      }
    } else {
      res.send({});
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);
    res.send({});
  }
};

var fileDelete = function (req, res, next) {
  var obj = req.body.form_data;
  var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.params.orgId);
  imagePath = imagePath + "url/" + obj.name;

  if (__util.isValidFile(imagePath) && !__util.isNullOrEmpty(req.params.orgId)) {
    fs.unlink(imagePath, function (err) {
      if (err) {
        $log.error('file delete: ' + err);

        res.send({
          "status": false,
          "msg": 'Invalid request.'
        });
      }

      res.send({
        "status": true
      });
    });
  } else {
    res.send({ "status": "Not Found" });
    return;
  }
};

var _uploadImage = function (context, type, isEncoded) {
  var req = context["req"];
  var res = context["res"];

  try {
    if (req.files) {
      for (var prop in req.files) {
        var file = req.files[prop];
        var isCategory = false;
        var imagePath = "";

        if (!__util.isNullOrEmpty(file.name)) {
          imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookie.oid);
          imagePath = !__util.isEmptyObject(req.data) && !__util.isEmptyObject(req.data.folder) ? imagePath + req.data.folder + "/" : imagePath;

          if (type == "categoryphoto") {
            fileName = __util.replaceEmpty(req.data.fileName + '.png');
            imagePath += 'categories/';
            isCategory = true;
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          fileName = Date.parse(new Date()) + fileName;

          if (isEncoded) {
            __util.fileUploadEncode(file, imagePath, fileName, function (error) {
              if (error) {
                $log.error('Original decoded image : ' + imagePath + ' Error: ' + error);
              }
            });

          } else {
            __util.fileUpload(file, imagePath, fileName, function (error) {
              if (error) {
                $log.error('Original image : ' + imagePath + ' Error: ' + error);
              }
            });
          }

          var pathUploaded = imagePath + fileName;
          _resizeUploadedImage(context, pathUploaded, fileName, 'upload', isCategory);
        }
      }
    } else {
      res.send(retrn);
    }
  } catch (err) {
    $log.error('upload : ' + err);
    $log.error('upload stack: ' + err.stack);
    res.send({});
  }
};

var _uploadPictureBlock = function (context, isEncoded) {
  var retrn = {};
  var req = context["req"];
  var res = context["res"];

  if (req.files) {
    var fileName;

    for (var prop in req.files) {
      var file = req.files[prop];

      if (!__util.isNullOrEmpty(file.name)) {
        var imagePath = __appPath + imageConf.tileImagefolder.replace('{0}', req.data.appId);
        __util.createDir(imagePath);

        imagePath = imagePath + req.data.tileId + '/';

        if (req.data.fileName) {
          fileName = Date.parse((new Date)) + __util.replaceEmpty(req.data.fileName + '.png');
        } else {
          fileName = Date.parse((new Date)) + __util.replaceEmpty(file.name);
        }

        $async.waterfall([
          function (callback) {
            if (isEncoded) {
              __util.fileUploadEncode(file, imagePath, fileName, function (error) {
                if (error) {
                  $log.error('picture block decoded image : ' + imagePath + ' Error: ' + error);
                  callback(error);
                }

                callback(null, imagePath, fileName);
              });

            } else {
              __util.fileUpload(file, imagePath, fileName, function (error) {
                if (error) {
                  $log.error('picture block image : ' + imagePath + ' Error: ' + error);
                  callback(error);
                }

                callback(null, imagePath, fileName);
              });
            }
          }], function (err, imagePath, fileName) {
            if (err) {
              $log.error("uploadPictureBlock: " + err);

              res.send({
                "status": "fail"
              });

              return;
            }

            var pathUploaded = imagePath + fileName;
            _resizeUploadedImage(context, pathUploaded, fileName);
            retrn.imageUrl = appConf.domain + imageConf.tileImageUrl.replace('{0}', req.data.appId).replace('{1}', req.data.tileId) + fileName;

            $tile.pushImageBlock(req.data.appId, req.data.tileId, retrn.imageUrl, req.data.caption, req.data.moderated, function (result) {
              res.send({
                "status": "success"
              });
            });
          });
      }
    }
  } else {
    res.send(retrn);
  }
};

var _profilePictureUpload = function (context, isEncoded) {
  query = {};
  var req = context["req"];
  var res = context["res"];

  var returnStatus = {
    "status": false
  };

  var fileName;

  try {
    if (!__util.isEmptyObject(req.files) && !__util.isNullOrEmpty(req.data.memberId)) {
      for (var prop in req.files) {
        var file = req.files[prop];

        if (!__util.isNullOrEmpty(file.name)) {
          var imagePath = __appPath + imageConf.imgProfileFolderPath.replace('{0}', req.data.memberId);

          if (req.data.fileName) {
            fileName = __util.replaceEmpty(req.data.fileName);
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          __util.createDir(imagePath);

          fileName = fileName.replace(/(\s)+/g, '_');
          var extension = "." + fileName.split('.').pop();

          var splitedName = fileName.split('.');
          fileName = splitedName[0] + "_" + Date.parse(new Date()) + extension;

          if (isEncoded) {
            __util.fileUploadEncode(file, imagePath, fileName, function (error) {
              if (error) {
                $log.error('Original decoded image : ' + imagePath + ' Error: ' + error);
              }
            });

          } else {
            __util.fileUpload(file, imagePath, fileName, function (error) {
              if (error) {
                $log.error('Original image : ' + imagePath + ' Error: ' + error);
              }
            });
          }

          var pathUploaded = appConf.domain + imageConf.imgProfileUrlPath.replace('{0}', req.data.memberId) + fileName;

          var dataToUpdate = {
            "image": pathUploaded
          };

          query._id = req.data.memberId;

          $member.appMemberUpdate(query, dataToUpdate, {}, function (result) {
            returnStatus.status = true;

            res.send(returnStatus);
          });
        }
      }
    } else {
      res.send(returnStatus);
    }
  } catch (err) {
    res.send(returnStatus);
  }
};

var _uploadTileImage = function (context, isEncoded) {
  var req = context["req"];
  var res = context["res"];

  query = {};
  query._id = req.data.tileId;

  $tile._getTiles(query, function (tiles) {
    if (tiles.length > 0) {
      var blockIds = tiles[0].blocks ? tiles[0].blocks : tiles[0].displayWidgets ? tiles[0].displayWidgets : [];

      $tileblock._getBlocks(blockIds, function (blocks) {
        var pictureBlock = _.findWhere(blocks, {
          type: "picture"
        });
        var data = {};

        if (pictureBlock) {
          _uploadPictureBlock(context, isEncoded);
        } else {
          res.send({});
        }
      });
    } else {
      res.send({});
    }
  });
};

var _photoUpload = function (context, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  var obj = req.data.jsonPayload;

  $async.waterfall([
    function (callback) {
      try {

        if (!__util.isEmptyObject(req.files) && !__util.isNullOrEmpty(obj.tileId) && !__util.isNullOrEmpty(obj.tileBlockId) && !__util.isNullOrEmpty(obj.memberId) && !__util.isNullOrEmpty(obj.appId)) {
          for (var prop in req.files) {
            var file = req.files[prop];
            var imagePath = "";

            if (!__util.isNullOrEmpty(file.name)) {
              if (obj.type == "eventphoto") {
                imagePath = __appPath + imageConf.imgFormPhotoFolderPath.replace('{0}', obj.memberId);

              } else {
                imagePath = __appPath + imageConf.tileImagefolder.replace('{0}', obj.appId);
                __util.createDir(imagePath);

                imagePath = imagePath + obj.tileId + '/';
              }

              if (req.data.fileName) {
                fileName = __util.replaceEmpty(req.data.fileName);

              } else {
                fileName = __util.replaceEmpty(file.name);
              }

              __util.createDir(imagePath);

              fileName = fileName.replace(/(\s)+/g, '_');
              var extension = "." + fileName.split('.').pop();

              var splitedName = fileName.split('.');

              var currFileName = splitedName[0];

              if (obj.hasOwnProperty("mediaName") && !__util.isNullOrEmpty(obj["mediaName"])) {
                currFileName = obj.mediaName;
                currFileName = currFileName.replace(/(\s)+/g, '_');
                fileName = currFileName + extension;
              } else {
                fileName = currFileName + "_" + Date.parse(new Date()) + extension;
              }

              if (isEncoded) {
                __util.fileUploadEncode(file, imagePath, fileName, function (error) {
                  if (error) {
                    $log.error('Original decoded image : ' + imagePath + ' Error: ' + error);
                  }
                });

              } else {
                __util.fileUpload(file, imagePath, fileName, function (error) {
                  if (error) {
                    $log.error('Original image : ' + imagePath + ' Error: ' + error);
                  }
                });
              }
              var returnUrl = "";

              if (obj.type == "formphoto") {
                returnUrl = appConf.domain + imageConf.tileImageUrl.replace('{0}', obj.appId).replace('{1}', obj.tileId) + fileName;

              } else {
                returnUrl = appConf.domain + imageConf.imgFormPhotoUrlPath.replace('{0}', obj.memberId) + fileName;
              }

              var imgObj = {
                "url": returnUrl
              };

              callback(null, imgObj);
            }
          }
        } else {
          callback(null, null);
        }

      } catch (err) {
        callback(null, null);
      }
    },
    function (imgObj, callback) {
      if (!imgObj) {
        callback(null);
      }

      $async.parallel({
        media: function (cb) {
          imgObj["appId"] = obj.appId;
          imgObj["memberId"] = obj.memberId;
          imgObj["tileId"] = obj.tileId;
          imgObj["tileBlockId"] = obj.tileBlockId;
          imgObj["type"] = obj.type;
          imgObj["moderated"] = !__util.isNullOrEmpty(obj.moderated) ? obj.moderated : false;
          imgObj["ratePicture"] = !__util.isNullOrEmpty(obj.ratePicture) ? obj.ratePicture : false;

          $media.save(imgObj, function (result) {
            cb(null, result);
          });
        },
        blockdata: function (cb) {
          if (obj.type == "formphoto") {
            query = {
              "tileId": $db.objectId(obj.tileId),
              "tileBlockId": $db.objectId(obj.tileBlockId),
              "memberId": $db.objectId(obj.memberId),
              "appId": $db.objectId(obj.appId)
            };

            if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
              query["procedureMappingId"] = $db.objectId(obj.procedureMappingId);
            }

            if (obj.days && !__util.isNullOrEmpty(obj.days)) {
              query["days"] = obj.days;
            }

            $memberblockdata._blockData(query, {}, function (memberBlock) {
              var blockToSave = {};

              if (memberBlock && memberBlock.length > 0) {
                blockToSave = memberBlock[0];
                blockToSave.data.url.push(imgObj.url);
                blockToSave.updatedDate = (new Date()).toUTCString();
                blockToSave["type"] = "formphoto";
                blockToSave._id = blockToSave._id.toString();

              } else {
                blockToSave = {
                  "tileId": $db.objectId(obj.tileId),
                  "tileBlockId": $db.objectId(obj.tileBlockId),
                  "memberId": $db.objectId(obj.memberId),
                  "appId": $db.objectId(obj.appId),
                  "type": "formphoto",
                  "data": {
                    "url": [imgObj.url]
                  },
                  "updatedDate": (new Date()).toUTCString()
                };

                if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
                  blockToSave["procedureMappingId"] = $db.objectId(obj.procedureMappingId);
                }

                if (obj.days && !__util.isNullOrEmpty(obj.days)) {
                  blockToSave["days"] = obj.days;
                }
              }

              $memberblockdata._saveMemberBlockData(blockToSave, function (result) {
                cb(null, result);
              });
            });
          } else {
            cb(null, {});
          }
        }
      }, function (err, results) {
        callback(null, results.media);
      });
    }], function (err, result) {
      res.send(result);
    });
};

var _decodeBase64Image = function (dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
};

var _drawImageUpload = function (context, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  var obj = req.data.jsonPayload;

  $async.waterfall([
    function (callback) {
      try {
        var imagePath = "";
        imagePath = __appPath + imageConf.tileImagefolder.replace('{0}', obj.appId);
        __util.createDir(imagePath);

        imagePath = imagePath + obj.tileId + '/';

        fileName = "draw.png";

        __util.createDir(imagePath);

        fileName = fileName.replace(/(\s)+/g, '_');
        var extension = "." + fileName.split('.').pop();

        var splitedName = fileName.split('.');
        fileName = splitedName[0] + "_" + Date.parse(new Date()) + extension;
        var imageBuffer = _decodeBase64Image(req.data.imageData);

        fs.writeFile(imagePath + fileName, imageBuffer.data, function (err) {
          if (err) {
            console.log(err);
          }
        });

        var returnUrl = appConf.domain + imageConf.tileImageUrl.replace('{0}', obj.appId).replace('{1}', obj.tileId) + fileName;

        var imgObj = {
          "url": returnUrl
        };

        callback(null, imgObj);

      } catch (err) {
        callback(null, {});
      }
    },
    function (imgObj, callback) {
      if (!imgObj) {
        callback(null);
      }

      $async.parallel({
        media: function (cb) {
          imgObj["appId"] = obj.appId;
          imgObj["memberId"] = obj.memberId;
          imgObj["tileId"] = obj.tileId;
          imgObj["tileBlockId"] = obj.tileBlockId;
          imgObj["type"] = obj.type;
          imgObj["moderated"] = !__util.isNullOrEmpty(obj.moderated) ? obj.moderated : false;
          imgObj["ratePicture"] = !__util.isNullOrEmpty(obj.ratePicture) ? obj.ratePicture : false;

          $media.save(imgObj, function (result) {
            cb(null, imgObj.url);
          });
        },
        blockdata: function (cb) {
          if (obj.type == "formphoto" || obj.type == "drawtool") {
            query = {
              "tileId": $db.objectId(obj.tileId),
              "tileBlockId": $db.objectId(obj.tileBlockId),
              "memberId": $db.objectId(obj.memberId),
              "appId": $db.objectId(obj.appId)
            };

            if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
              query["procedureMappingId"] = $db.objectId(obj.procedureMappingId);
            }

            if (obj.days && !__util.isNullOrEmpty(obj.days)) {
              query["days"] = obj.days;
            }

            $memberblockdata._blockData(query, {}, function (memberBlock) {
              var blockToSave = {};

              if (memberBlock && memberBlock.length > 0) {
                blockToSave = memberBlock[0];
                blockToSave.data.url.push(imgObj.url);
                blockToSave.updatedDate = (new Date()).toUTCString();
                blockToSave["type"] = obj.type;
                blockToSave._id = blockToSave._id.toString();

              } else {
                blockToSave = {
                  "tileId": $db.objectId(obj.tileId),
                  "tileBlockId": $db.objectId(obj.tileBlockId),
                  "memberId": $db.objectId(obj.memberId),
                  "appId": $db.objectId(obj.appId),
                  "type": obj.type,
                  "data": {
                    "url": [imgObj.url]
                  },
                  "updatedDate": (new Date()).toUTCString()
                };

                if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
                  blockToSave["procedureMappingId"] = $db.objectId(obj.procedureMappingId);
                }

                if (obj.days && !__util.isNullOrEmpty(obj.days)) {
                  blockToSave["days"] = obj.days;
                }
              }

              $memberblockdata._saveMemberBlockData(blockToSave, function (result) {
                cb(null, result);
              });
            });
          } else {
            cb(null, {});
          }
        }
      }, function (err, results) {
        callback(null, results.media);
      });
    }], function (err, result) {
      res.send(result);
    });
};

var _blankFormImageUpload = function (context, isEncoded) {
  var req = context["req"];
  var res = context["res"];

  var obj = req.data.jsonPayload;

  $async.waterfall([
    function (callback) {
      try {
        var imagePath = "";
        imagePath = __appPath + imageConf.tileImagefolder.replace('{0}', obj.appId);
        __util.createDir(imagePath);

        imagePath = imagePath + obj.tileId + '/';

        fileName = "blankformimage.png";

        __util.createDir(imagePath);

        fileName = fileName.replace(/(\s)+/g, '_');
        var extension = "." + fileName.split('.').pop();

        var splitedName = fileName.split('.');
        fileName = splitedName[0] + "_" + Date.parse(new Date()) + extension;
        var imageBuffer = _decodeBase64Image(req.data.imageData);

        fs.writeFile(imagePath + fileName, imageBuffer.data, function (err) {
          if (err) {
            console.log(err);
          }
        });

        var returnUrl = appConf.domain + imageConf.tileImageUrl.replace('{0}', obj.appId).replace('{1}', obj.tileId) + fileName;

        var imgObj = {
          "url": returnUrl
        };

        callback(null, imgObj);

      } catch (err) {
        callback(null, {});
      }
    },
    function (imgObj, callback) {
      if (!imgObj) {
        callback(null);
      }

      $async.parallel({
        media: function (cb) {
          imgObj["appId"] = obj.appId;
          imgObj["memberId"] = obj.memberId;
          imgObj["tileId"] = obj.tileId;
          imgObj["tileBlockId"] = obj.tileBlockId;
          imgObj["type"] = obj.type;
          imgObj["moderated"] = false;
          imgObj["ratePicture"] = false;

          $media.save(imgObj, function (result) {
            cb(null, imgObj);
          });
        },
        blockdata: function (cb) {
          query = {
            "tileId": $db.objectId(obj.tileId),
            "tileBlockId": $db.objectId(obj.tileBlockId),
            "memberId": $db.objectId(obj.memberId),
            "appId": $db.objectId(obj.appId),
            "isEmail": false
          };

          if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
            query["procedureMappingId"] = $db.objectId(obj.procedureMappingId);
          }

          $memberblockdata._blockData(query, {}, function (memberBlock) {
            var blockToSave = {};

            if (memberBlock && memberBlock.length > 0) {
              blockToSave = memberBlock[0];
              var data = blockToSave.data;

              if (data.url) {
                blockToSave.data.url.push(imgObj.url);
              } else {
                data["url"] = [imgObj.url];

                blockToSave['data'] = data;
              }

              blockToSave.updatedDate = (new Date()).toUTCString();
              blockToSave._id = blockToSave._id.toString();

              if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
                blockToSave["procedureMappingId"] = obj.procedureMappingId;
              }
            } else {
              blockToSave = {
                "tileId": $db.objectId(obj.tileId),
                "tileBlockId": $db.objectId(obj.tileBlockId),
                "memberId": $db.objectId(obj.memberId),
                "appId": $db.objectId(obj.appId),
                "type": obj.type,
                "isEmail": false,
                "data": {
                  "url": [imgObj.url]
                },
                "updatedDate": (new Date()).toUTCString()
              };

              if (obj.procedureMappingId && !__util.isNullOrEmpty(obj.procedureMappingId)) {
                blockToSave["procedureMappingId"] = $db.objectId(obj.procedureMappingId);
              }
            }

            $memberblockdata._saveMemberBlockData(blockToSave, function (result) {
              blockToSave["_id"] = result.toString();
              cb(null, blockToSave);
            });
          });
        }
      }, function (err, results) {
        var obj = results.media;
        var memberData = results.blockdata;
        obj._id = memberData._id;

        callback(null, obj);
      });
    }], function (err, result) {
      res.send(result);
    });
};

var _resizeUploadedImage = function (context, path, fileName, retrn, categories) {
  var req = context["req"];
  var res = context["res"];

  var urlRtrn = {};
  var curHeight;
  var curWidth;
  var obj = !__util.isEmptyObject(req.body.form_data) ? req.body.form_data : {};
  obj.folder = !__util.isEmptyObject(req.data) && !__util.isEmptyObject(req.data.folder) ? req.data.folder : !__util.isNullOrEmpty(obj.folder) ? obj.folder : '';

  easyImg.info(path, function (err, stdout, stderr) {
    if (err) {
      $log.error('Image info: ' + err);
      res.send({ "status": "Not Found" });
      return;
    }

    if (stdout.width <= 960) {
      curWidth = stdout.width;
    } else {
      curWidth = 960;
    }

    if (stdout.height <= 450) {
      curHeight = stdout.height;
    } else {
      curHeight = 450;
    }

    if (!__util.isEmptyObject(req.data) && req.data.popupFrom == 'tileart' && curWidth > 640) {
      curWidth = 640;
    }

    easyImg.resize({
      src: path,
      dst: path,
      width: curWidth,
      height: curHeight,
      quality: 50
    }, function (err, image) {
      if (err) {
        $log.error('image resizing: ' + err);
        res.send({ "status": "Not Found" });
        return;
      }

      if (categories) {
        urlRtrn.imageUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', req.cookie.oid) + 'categories/' + fileName;
      } else if (obj.folder == "stream") {
        var imgUrl = appConf.domain + imageConf.imgStreamUrlPath.replace('{0}', obj._id);
        imgUrl = imgUrl.replace("{1}", obj._id);
        imgUrl = imgUrl + fileName;

        urlRtrn.imageUrl = imgUrl;
      } else {
        var imgUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', req.cookie.oid);
        imgUrl = !__util.isNullOrEmpty(obj.folder) ? imgUrl + obj.folder + "/" + fileName : imgUrl + fileName;
        urlRtrn.imageUrl = imgUrl;
      }

      switch (retrn) {
        case "upload":
          res.send(urlRtrn);
          break;
        case "crop":
          res.send(urlRtrn.imageUrl);
          break;
      }
    });
  });
};

var _resizeOptions = function (context) {
  var filePath = "";
  var destFileName = "";
  var url = context.req.url;

  if (url.indexOf('/img/groups/') > -1) {
    var groupType = request.params.type;
    var groupId = request.params.id;
    destFileName = request.params.name;

    filePath = __appPath + imageConf.imgGroupFolderPath.replace('{0}', groupType);
    filePath = filePath.replace('{1}', groupId);

  } else if (url.indexOf('/img/orgs/') > -1) {
    var orgId = request.params.id;
    filePath = __appPath + imageConf.imgfolderpath.replace('{0}', orgId);

    if (!__util.isNullOrEmpty(obj.folder)) {
      destFileName = request.params.folder;
    }

    if (!__util.isNullOrEmpty(obj.name)) {
      destFileName = request.params.name;
      filePath = filePath + request.params.name + '/';
    }
  } else if (url.indexOf('/img/emoticons/') > -1) {
    var orgId = request.params.orgId;
    destFileName = request.params.name;

    filePath = __appPath + imageConf.imgEmoticonsFolderPath.replace('{0}', orgId);

  } else if (url.indexOf('/img/apps/') > -1) {
    var appId = request.params.appId;
    var pageId = request.params.pageId;
    destFileName = request.params.name;

    filePath = __appPath + imageConf.imgAppFolderPath.replace('{0}', appId);
    filePath = filePath.replace('{1}', pageId);

  } else if (url.indexOf('/img/profile/') > -1) {
    var memberId = request.params.memberId;
    destFileName = request.params.name;

    filePath = __appPath + imageConf.imgProfileFolderPath.replace('{0}', memberId);

  } else if (url.indexOf('/img/streams/') > -1) {
    var streamId = request.params.streamId;
    destFileName = request.params.name;

    filePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', streamId);

  }

  var options = {};

  if (!__util.isNullOrEmpty(destFileName)) {
    var destFileExt = path.extname(destFileName);
    var fileOutExt = path.basename(destFileName, destFileExt);

    var indx = fileOutExt.lastIndexOf("_");
    var fileSize = fileOutExt.substring(indx + 1);

    var width = fileSize.split("x")[0];
    var height = __util.isNullOrEmpty(fileSize.split("x")[1]) ? "0" : fileSize.split("x")[1];

    var srcFileName = fileOutExt.substring(0, indx) + destFileExt;
    srcFileName = filePath + srcFileName;
    destFileName = filePath + destFileName;


    options.x = 0, options.y = 0, options.src = srcFileName, options.dst = destFileName, options.width = parseInt(width), options.height = parseInt(height);
  }

  return options;
};

var streamCrownImageRemove = function (req, res, next) {
  var obj = req.body.form_data;
  var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', obj.id);
  imagePath = imagePath + "crown/" + obj.fileName;

  if (__util.isValidFile(imagePath)) {
    fs.unlink(imagePath, function (err) {
      if (err) {
        $log.error('image delete: ' + err);

        res.send({
          "status": false
        });
      }

      res.send({
        "status": true
      });
    });
  } else {
    res.send({
      "status": false
    });
  }
};

var _remove = function (src, cb) {
  if (__util.isValidFile(src)) {
    fs.unlink(src, function (err) {
      if (err) {
        $log.error('image delete: ' + err);
        cb({
          "status": false
        })
      }

      cb({
        "status": true
      })
    });
  } else {
    cb({
      "status": false
    })
  }
};

module.exports = {
  "init": init,
  "upload": upload,
  "list": list,
  "crop": crop,
  "remove": remove,
  "saveFolder": saveFolder,
  "folder": folder,
  "backgroundPatternUpload": backgroundPatternUpload,
  "backgroundPatternRemove": backgroundPatternRemove,
  "backgroundPatternList": backgroundPatternList,
  "uploadBackgroundGroup": uploadBackgroundGroup,
  "backgroundPatternUpload": backgroundPatternUpload,
  "bgGroupRemove": bgGroupRemove,
  "backgroundPatternList": backgroundPatternList,
  "uploadBackgroundGroup": uploadBackgroundGroup,
  "bgGroupList": bgGroupList,
  "emoticonsUpload": emoticonsUpload,
  "emoticonsList": emoticonsList,
  "emoticonsDelete": emoticonsDelete,
  "profiePictureUpload": profiePictureUpload,
  "profieEncodeUpload": profieEncodeUpload,
  "streamUpload": streamUpload,
  "streamCrownUpload": streamCrownUpload,
  "streamCrownImageRemove": streamCrownImageRemove,
  "streamList": streamList,
  "formPhotoUpload": formPhotoUpload,
  "fileDelete": fileDelete,
  "urlList": urlList,
  "uploadTileImage": uploadTileImage,
  "uploadImage": uploadImage,
  "uploadDecodedTileImage": uploadDecodedTileImage,
  "exclusiveFileUpload": exclusiveFileUpload,
  "resize": resize
};
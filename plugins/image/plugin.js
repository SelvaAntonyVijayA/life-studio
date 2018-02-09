var imageConf, appConf, __appPath;
const fs = require('fs');
const path = require('path');
const gm = require('gm');
const util = require('util');
const formidable = require('formidable')

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

  _formParse(req, function (data, files) {
    var isEncoded = typeof data.isEncoded == 'undefined' || data.isEncoded == "false" ? false : true;

    _uploadImage(context, data, files, isEncoded);
  });
};

var uploadImage = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _formParse(req, function (data, files) {
    var postData = data.jsonPayload;
    var type = postData.type;
    var isEncoded = typeof data.isEncoded == 'undefined' || data.isEncoded == "false" ? false : true;

    if (type == "tilephoto") {
      _uploadTileImage(context, data, files, isEncoded);
    } else if (type == "formphoto" || type == "eventphoto") {
      _photoUpload(context, data, files, isEncoded);
    } else if (type == "categoryphoto") {
      _uploadImage(context, data, files, isEncoded);
    } else if (type == "profilephoto") {
      _profilePictureUpload(context, data, files, isEncoded);
    } else if (type == "drawtool") {
      _drawImageUpload(context, data, files, isEncoded);
    } else if (type == "blanksform") {
      _blankFormImageUpload(context, data, files, isEncoded);
    } else {
      _uploadImage(context, data, files, isEncoded);
    }

  });
};

var uploadTileImage = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _formParse(req, function (data, files) {
    _uploadTileImage(context, data, files, false);
  });
};

var uploadDecodedTileImage = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _formParse(req, function (data, files) {
    _uploadTileImage(context, data, files, true);
  });
};

var resize = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  $async.waterfall([
    function (callback) {
      var options = _resizeOptions(context);
      console.dir(options)

      if (options.height === 0 && __util.isValidFile(options.src)) {

        gm(options.src)
          .size(function (err, size) {
            if (err) {
              $log.error('URL resize image info: ' + err);
              callback(null, options, true);
            } else {
              console.log('width = ' + size.width);
              console.log('height = ' + size.height);

              options.height = parseInt((size.height / size.width) * options.width);
              var returnOriginalImage = (size.width < options.width);

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

          _resizer(options.src, options.dst, options.width, options.height, function (err, image) {
            if (err) {
              $log.error('image resize: ' + err);

              res.send({ "status": "Not Found" });
              return;
            }

            options.dst = options.dst.replace(/"/gi, "");

            res.send(options.dst);
          });
        } else {
          res.send(options.src);
        }
      } else {
        res.send({ "status": "Not Found" });
        return;
      }
    });
};

var crop = function (req, res, next) {
  var dstFileName = '';
  var obj = data.form_data;
  var context = { "req": req, "res": res, "next": next };
  var fileName = obj.src.split('/').pop();
  var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookies.oid);

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
  var obj = data.form_data;
  var fileName = __appPath + imageConf.imgfolderpath.replace('{0}', obj.organizationId) + obj.name;

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
  var obj = data.form_data;
  var isArray = obj.hasOwnProperty("src") && util.isArray(obj.src) ? true : false;

  if (isArray) {
    var resultArray = [];

    $async.each(obj.src, function (file, loop) {
      var fileName = file.split('/').pop();
      var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookies.oid);

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
    var imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookies.oid);

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

  _formParse(req, function (data, files) {
    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];

          if (!__util.isNullOrEmpty(file.name)) {
            var pathCount = 0;
            var id = data._id;
            var group = data.group;
            var type = data.type;
            var pageFrom = data.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(data.pagefrom) ? data.pagefrom : "";

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

  });
};

var backgroundPatternUpload = function (req, res, next) {
  var retrn = {};
  var fileName;

  _formParse(req, function (data, files) {

    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];

          if (!__util.isNullOrEmpty(file.name)) {
            var pathCount = 0;
            var appId = data.appId;
            var pageId = data.pageId;
            var type = data.type;
            var pageFrom = data.hasOwnProperty("pagefrom") && !__util.isNullOrEmpty(data.pagefrom) ? data.pagefrom : "";
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
  });
};

var backgroundPatternRemove = function (req, res, next) {
  var obj = data.form_data;
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
  var obj = data.form_data;
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
  var obj = data.form_data;
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
  var obj = data.form_data;
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

  _formParse(req, function (data, files) {

    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];

          if (!__util.isNullOrEmpty(file.name)) {
            var imagePath = __appPath + imageConf.imgEmoticonsFolderPath.replace('{0}', req.cookies.oid);

            if (data.fileName) {
              fileName = __util.replaceEmpty(data.fileName);
            } else {
              fileName = __util.replaceEmpty(file.name);
            }

            if (data.id) {
              id = __util.replaceEmpty(data.id);
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

            var pathUploaded = appConf.domain + imageConf.imgEmoticonsUrlPath.replace('{0}', req.cookies.oid) + fileName;

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
  });
};

var emoticonsList = function (req, res, next) {
  query = {};
  query.organizationId = req.params.orgId;

  var rootFolder = __appPath + imageConf.imgEmoticonsFolderPath.replace('{0}', req.cookies.oid);
  var imageUrl = appConf.domain + imageConf.imgEmoticonsUrlPath.replace('{0}', req.cookies.oid);

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
  var obj = data.form_data;
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

  _formParse(req, function (data, files) {
    _profilePictureUpload(context, data, files, true);
  });
};

var profiePictureUpload = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _formParse(req, function (data, files) {
    _profilePictureUpload(context, data, files, false);
  });
};

var formPhotoUpload = function (req, res, next) {
  var context = { "req": req, "res": res, "next": next };

  _formParse(req, function (data, files) {
    var isEncoded = typeof data.isEncoded == 'undefined' || data.isEncoded == "false" ? false : true;

    _photoUpload(context, data, files, isEncoded);
  });
};

var streamUpload = function (req, res, next) {
  var retrn = {};
  var fileName;
  var id;

  _formParse(req, function (data, files) {
    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];

          if (data.id) {
            id = __util.replaceEmpty(data.id);
          }

          if (!__util.isNullOrEmpty(file.name)) {
            var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', id);

            if (data.fileName) {
              fileName = __util.replaceEmpty(data.fileName);
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
  });
};

var streamCrownUpload = function (req, res, next) {
  var retrn = {};
  var fileName;
  var id;

  _formParse(req, function (data, files) {
    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];

          if (data.id) {
            id = __util.replaceEmpty(data.id);
          }

          if (!__util.isNullOrEmpty(file.name)) {
            var imagePath = __appPath + imageConf.imgStreamFolerPath.replace('{0}', id);

            __util.createDir(imagePath);

            imagePath = imagePath + "crown/";

            if (data.fileName) {
              fileName = __util.replaceEmpty(data.fileName);
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
  });
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

  _formParse(req, function (data, files) {
    var folder = typeof data.folder == 'undefined' ? "" : data.folder;
    var isEncoded = typeof data.isEncoded == 'undefined' || data.isEncoded == "false" ? false : true;

    try {
      if (files) {
        for (var prop in files) {
          var file = files[prop];
          var imagePath = "";
          var fileName = "";

          if (data.fileName) {
            fileName = __util.replaceEmpty(data.fileName);
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

            _upload(isEncoded, file, imagePath, fileName, function (error) {
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
  });
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

var _uploadImage = function (context, data, files, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  var type = data.type;
  var folder = typeof data.folder == 'undefined' ? "" : data.folder;

  try {
    if (files) {
      for (var prop in files) {
        var file = files[prop];
        var isCategory = false;
        var imagePath = "";

        if (!__util.isNullOrEmpty(file.name)) {
          imagePath = __appPath + imageConf.imgfolderpath.replace('{0}', req.cookies.oid);
          imagePath = !__util.isEmptyObject(folder) ? imagePath + folder + "/" : imagePath;

          if (type == "categoryphoto") {
            fileName = __util.replaceEmpty(data.fileName + '.png');
            imagePath += 'categories/';
            isCategory = true;
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          fileName = Date.parse(new Date()) + fileName;

          _upload(isEncoded, file, imagePath, fileName, function (error) {
            if (error) {
              $log.error('Original decoded image : ' + imagePath + ' Error: ' + error);
            }

            var pathUploaded = imagePath + fileName;

            _resizeUploadedImage(context, data, pathUploaded, fileName, 'upload', isCategory);
          });
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

var _upload = function (isEncoded, file, imagePath, fileName, callback) {
  if (isEncoded) {
    __util.fileUploadEncode(file, imagePath, fileName, function (error) {
      if (error) {

        callback(error);
      }
      else {
        callback();
      }
    });

  } else {
    __util.fileUpload(file, imagePath, fileName, function (error) {
      if (error) {
        $log.error('Original image : ' + imagePath + ' Error: ' + error);
      }

      callback();
    });
  }
}

var _uploadPictureBlock = function (context, data, files, isEncoded) {
  var retrn = {};
  var req = context["req"];
  var res = context["res"];
  var type = data.type;
  var folder = typeof data.folder == 'undefined' ? "" : data.folder;

  if (files) {
    var fileName;

    for (var prop in files) {
      var file = files[prop];

      if (!__util.isNullOrEmpty(file.name)) {
        var imagePath = __appPath + imageConf.tileImagefolder.replace('{0}', data.appId);
        __util.createDir(imagePath);

        imagePath = imagePath + data.tileId + '/';

        if (data.fileName) {
          fileName = Date.parse((new Date)) + __util.replaceEmpty(data.fileName + '.png');
        } else {
          fileName = Date.parse((new Date)) + __util.replaceEmpty(file.name);
        }

        $async.waterfall([
          function (callback) {
            _upload(isEncoded, file, imagePath, fileName, function (error) {
              if (error) {
                $log.error('picture block decoded image : ' + imagePath + ' Error: ' + error);
                callback(error);
              }

              var pathUploaded = imagePath + fileName;

              callback(null, imagePath, fileName);
            });
          }], function (err, imagePath, fileName) {
            if (err) {
              $log.error("uploadPictureBlock: " + err);

              res.send({
                "status": "fail"
              });

              return;
            }

            var pathUploaded = imagePath + fileName;
            _resizeUploadedImage(context, data, pathUploaded, fileName);
            retrn.imageUrl = appConf.domain + imageConf.tileImageUrl.replace('{0}', data.appId).replace('{1}', data.tileId) + fileName;

            $tile.pushImageBlock(data.appId, data.tileId, retrn.imageUrl, data.caption, data.moderated, function (result) {
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

var _profilePictureUpload = function (context, data, files, isEncoded) {
  query = {};
  var req = context["req"];
  var res = context["res"];
  var returnStatus = { "status": false };
  var fileName;

  try {
    if (!__util.isEmptyObject(files) && !__util.isNullOrEmpty(data.memberId)) {
      for (var prop in files) {
        var file = files[prop];

        if (!__util.isNullOrEmpty(file.name)) {
          var imagePath = __appPath + imageConf.imgProfileFolderPath.replace('{0}', data.memberId);

          if (data.fileName) {
            fileName = __util.replaceEmpty(data.fileName);
          } else {
            fileName = __util.replaceEmpty(file.name);
          }

          __util.createDir(imagePath);

          fileName = fileName.replace(/(\s)+/g, '_');
          var extension = "." + fileName.split('.').pop();

          var splitedName = fileName.split('.');
          fileName = splitedName[0] + "_" + Date.parse(new Date()) + extension;

          _upload(isEncoded, file, imagePath, fileName, function (error) {
            if (error) {
              if (isEncoded) {
                $log.error('Original image : ' + imagePath + ' Error: ' + error);
              } else {
                $log.error('Original decoded image : ' + imagePath + ' Error: ' + error);
              }
            }
          });

          var pathUploaded = appConf.domain + imageConf.imgProfileUrlPath.replace('{0}', data.memberId) + fileName;
          var dataToUpdate = { "image": pathUploaded };
          query = {};
          query._id = data.memberId;

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

var _uploadTileImage = function (context, data, files, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  query = {};
  query._id = data.tileId;

  $tile._getTiles(query, function (tiles) {
    if (tiles.length > 0) {
      var blockIds = tiles[0].blocks ? tiles[0].blocks : tiles[0].displayWidgets ? tiles[0].displayWidgets : [];

      $tileblock._getBlocks(blockIds, function (blocks) {
        var pictureBlock = _.findWhere(blocks, {
          type: "picture"
        });

        if (pictureBlock) {
          _uploadPictureBlock(context, data, files);
        } else {
          res.send({});
        }
      });
    } else {
      res.send({});
    }
  });
};

var _photoUpload = function (context, data, files, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  var fileName;
  var obj = data.jsonPayload;

  $async.waterfall([
    function (callback) {
      try {

        if (!__util.isEmptyObject(files) && !__util.isNullOrEmpty(obj.tileId) && !__util.isNullOrEmpty(obj.tileBlockId) && !__util.isNullOrEmpty(obj.memberId) && !__util.isNullOrEmpty(obj.appId)) {
          for (var prop in files) {
            var file = files[prop];
            var imagePath = "";

            if (!__util.isNullOrEmpty(file.name)) {
              if (obj.type == "eventphoto") {
                imagePath = __appPath + imageConf.imgFormPhotoFolderPath.replace('{0}', obj.memberId);

              } else {
                imagePath = __appPath + imageConf.tileImagefolder.replace('{0}', obj.appId);
                __util.createDir(imagePath);

                imagePath = imagePath + obj.tileId + '/';
              }

              if (data.fileName) {
                fileName = __util.replaceEmpty(data.fileName);

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

              _upload(isEncoded, file, imagePath, fileName, function (error) {
                if (error) {
                  if (isEncoded) {
                    $log.error('Original image : ' + imagePath + ' Error: ' + error);
                  } else {
                    $log.error('Original decoded image : ' + imagePath + ' Error: ' + error);
                  }
                }
              });

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

var _drawImageUpload = function (context, data, files, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  var fileName;
  var obj = data.jsonPayload;

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
        var imageBuffer = _decodeBase64Image(data.imageData);

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

var _blankFormImageUpload = function (context, data, files, isEncoded) {
  var req = context["req"];
  var res = context["res"];
  var obj = data.jsonPayload;

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
        var imageBuffer = _decodeBase64Image(data.imageData);

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

var _resizeUploadedImage = function (context, data, path, fileName, retrn, categories) {
  var req = context["req"];
  var res = context["res"];
  var urlRtrn = {};
  var curHeight;
  var curWidth;
  var obj = !__util.isEmptyObject(data.form_data) ? data.form_data : {};
  obj.folder = typeof data.folder == 'undefined' || __util.isEmptyObject(data.folder) ? "" : data.folder;

  gm(path)
    .size(function (err, size) {
      if (err) {
        $log.error('Image info: ' + err);
        res.send({ "status": "Not Found" });
        return;
      }

      console.log('width = ' + size.width);
      console.log('height = ' + size.height);

      if (size.width <= 960) {
        curWidth = size.width;
      } else {
        curWidth = 960;
      }

      if (size.height <= 450) {
        curHeight = size.height;
      } else {
        curHeight = 450;
      }

      if (!__util.isEmptyObject(data) && data.popupFrom == 'tileart' && curWidth > 640) {
        curWidth = 640;
      }

      _resizer(path, path, curWidth, curHeight, function (err) {
        if (err) {
          $log.error('image resizing: ' + err);
          res.send({ "status": "Not Found" });
          return;
        }

        if (categories) {
          urlRtrn.imageUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', req.cookies.oid) + 'categories/' + fileName;
        } else if (obj.folder == "stream") {
          var imgUrl = appConf.domain + imageConf.imgStreamUrlPath.replace('{0}', obj._id);
          imgUrl = imgUrl.replace("{1}", obj._id);
          imgUrl = imgUrl + fileName;

          urlRtrn.imageUrl = imgUrl;
        } else {
          var imgUrl = appConf.domain + imageConf.imgurlpath.replace('{0}', req.cookies.oid);
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

      })
    });
};

var _resizer = function (src, dest, width, height, callback) {
  gm(path)
    .resize(width, height)
    .quality(50)
    .write(dest, callback);
};

var _resizeOptions = function (context) {
  var filePath = "";
  var destFileName = "";
  var request = context["req"];
  var url = request.url;

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
  var obj = data.form_data;
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

var _formParse = function (req, cb) {
  var form = new formidable.IncomingForm();
  form.multiples = true;
  form.keepExtensions = true;

  form.parse(req, function (err, data, files) {
    cb(data, files);
  })
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
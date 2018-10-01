var videoConf = {};
var appConf = {};
const fs = require('fs');
const path = require('path');
const request = require('request');
const Vimeo = require('vimeo').Vimeo;
const crypto = require('crypto');
const https = require('https');
const formidable = require('formidable');
var lib;

var init = function (app) {
  appConf = app.get('settings');
  videoConf = appConf["video"];

  lib = new Vimeo(videoConf.VimeoClientId, videoConf.VimeoClientSecret, videoConf.VimeoAccessToken);
};

var list = function (req, res, next) {
  let query = {};
  query.organizationId = req.params.orgId;

  var rootFolder = appConf.domain + videoConf.videofolderpath.replace('{0}', query.organizationId);

  if (__util.isValidPath(rootFolder) && !__util.isNullOrEmpty(query.organizationId)) {
    fs.readdir(rootFolder, function (err, files) {
      if (err) {
        $log.error('video upload: ' + err);
      }
      var videoList = [];

      _.each(files, function (file) {
        videoList.push(videoConf.videourlpath.replace('{0}', query.organizationId) + file);
      });

      res.send(videoList);
    });
  } else {
    res.send([]);
  }
};

var upload = function (req, res, next) {
  let query = {};
  query.organizationId = req.params.orgId;

  var retrn = {};
  formParse(req, function (data, files) {

    if (files) {
      for (var prop in files) {
        var file = files[prop];

        if (!__util.isNullOrEmpty(file.name)) {
          var fileName = __util.replaceEmpty(file.name);
          var orgFolder = videoConf.videofolderpath.replace('{0}', query.organizationId);
          var videoPath = appConf.domain + orgFolder;

          __util.fileUpload(file, videoPath, fileName, function (error) {
            if (error) {
            }
          });
          retrn.videoUrl = videoConf.videourlpath.replace('{0}', query.organizationId) + fileName;
        }
      }
      res.send(retrn);
    } else {
      res.send(retrn);
    }
  });
};

var vimeocreate = function (req, res, next) {
  lib.request({
    method: "POST",
    path: "/me/videos",
    query: {
      type: "streaming"
    }
  }, function (err, resp) {
    vimeoLog('video upload ticket request', '/me/videos', {});

    res.send(resp);
  });
};

var jwcreate = function (req, res, next) {
  var api_url = _createVideoUpload();

  request(api_url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var jsonData = JSON.parse(response.body);

      res.send(jsonData);
    }
  });
};

var pictureUpload = function (req, res, next) {
  var videoId = "";
  var id = "";

  if (!__util.isNullOrEmpty(req.params.videoId)) {
    videoId = req.params.videoId;
  }

  if (!__util.isNullOrEmpty(req.body.videoid)) {
    videoId = req.body.videoid;
  }

  if (!__util.isNullOrEmpty(req.body.id)) {
    id = req.body.id;
  }

  $async.waterfall([
    function (callback) {
      var api_url = "https://api.vimeo.com/videos/" + videoId + "/pictures";

      var options = {
        method: 'post',
        url: api_url,
        headers: {
          Accept: "application/vnd.vimeo.*+json;version=3.2",
          Authorization: 'Bearer ' + videoConf.VimeoAccessToken,
          'User-Agent': 'Vimeo.js/1.2.0'
        }
      };

      request(options, function (error, response, body) {
        if (error) {
          $log.error('vimeo request url: ' + api_url);
          $log.error('vimeo request: ' + error);
        }

        if (!error && response.statusCode == 201) {
          var jsonData = JSON.parse(response.body);

          if (!__util.isEmptyObject(jsonData)) {
            callback(null, jsonData);
          } else {
            callback(null, {});
          }

        } else {
          callback(null, {});
        }
      });
    },
    function (data, callback) {
      if (!__util.isNullOrEmpty(data.link)) {
        var link = data.link;

        _formParse(req, function (data, files) {
          try {
            if (__util.isEmptyObject(files)) {
              callback(null, data);
            } else {
              for (var prop in files) {
                var file = files[prop];

                fs.readFile(file.path, function (err, fileData) {
                  request({
                    url: link,
                    method: 'PUT',
                    body: fileData,
                  }, (error, response, body) => {
                    if (error) {
                      callback(null, data);
                    } else {
                      imageComplete(data.uri, function (result) {
                        result["link"] = data.link;

                        callback(null, result);
                      });
                    }
                  });
                });
              }
            }

          } catch (err) {
            $log.error('upload : ' + err);
            $log.error('upload stack: ' + err.stack);
            callback(null, data);
          }
        });
      }
    },
  ], function (err, jsonData) {
    query = {};
    options = {};

    if ((!__util.isNullOrEmpty(id) && !__util.isNullOrEmpty(videoId)) || (!__util.isNullOrEmpty(id) && __util.isNullOrEmpty(videoId))) {
      query._id = id;
    } else if (__util.isNullOrEmpty(id) && !__util.isNullOrEmpty(videoId)) {
      query.vimeoId = videoId;
    }

    if (__util.isNullOrEmpty(id) && __util.isNullOrEmpty(videoId)) {
      res.send(jsonData);
      return;
    }

    var obj = {};
    obj["thumbnail"] = jsonData;

    videoUpdate(query, options, obj, function (result) {
      res.send(jsonData);
    });
  });
};

var vimeoJson = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      var mediaQuery = {};
      options = {};
      mediaQuery.videoId = req.params.videoId;

      $media._getMedia(mediaQuery, options, function (media) {
        callback(null, media);
      });
    },
    function (media, callback) {
      var obj = media.length > 0 ? media[0] : {};
      var vData = _getVimeoGet(obj, req.params.videoId);

      if (__util.isEmptyObject(vData.album)) {
        var videoId = req.params.videoId.indexOf(":") !== -1 ? req.params.videoId.split(":")[0] : req.params.videoId;

        vimeoRequest(videoId, function (response) {
          callback(null, response, true);
        });
      } else {
        callback(null, obj, false);
      }
    },
  ], function (err, jsonData, isUpdate) {
    if (isUpdate) {
      query = {};
      options = {};
      query.videoId = req.params.videoId;

      var obj = {};
      obj["vimeoData"] = jsonData;

      $media.mediaUpdate(query, options, obj, function (result) {
        res.send(_getVimeoGet(obj, req.params.videoId));
      });

    } else {
      res.send(_getVimeoGet(jsonData, req.params.videoId));
    }
  });
};

var mediaVimeoUpdate = function (mediaId, videoId, cb) {
  $async.waterfall([
    function (callback) {
      var mediaQuery = {
        _id: mediaId
      };

      $media._getMedia(mediaQuery, {}, function (media) {
        callback(null, $general.convertToJsonObject(media));
      });

    },
    function (media, callback) {
      if (media.length > 0) {
        var vData = _getVimeoGet(media[0], videoId);

        if (!__util.isEmptyObject(vData.album)) {
          callback(null, true);

        } else {
          var svideoId = videoId.indexOf(":") !== -1 ? videoId.split(":")[0] : videoId;

          vimeoRequest(svideoId, function (response) {
            callback(null, false, response);
          });
        }

      } else {
        callback(null, true);
      }

    },
  ], function (err, isExists, jsonData) {
    var jobName = mediaId + "-" + videoId;

    if (isExists) {
      cb(true, jobName);

    } else if (!isExists && !__util.isEmptyObject(jsonData)) {
      var mquery = {
        _id: mediaId
      };

      var obj = {};
      obj["vimeoData"] = jsonData;

      $media.mediaUpdate(mquery, {}, obj, function (result) {
        cb(true, jobName);
      });

    } else {
      cb(false);
    }
  });
};

var vimeoRequest = function (videoId, callback) {
  var api_url = ("https://api.vimeo.com/me/videos/").concat(videoId);

  var options = {
    method: 'GET',
    url: api_url,
    headers: {
      Accept: "application/vnd.vimeo.*+json;version=3.2",
      Authorization: 'Bearer ' + videoConf.VimeoAccessToken,
      'User-Agent': 'Vimeo.js/1.2.0'
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      $log.error('vimeo request url: ' + api_url);
      $log.error('vimeo request: ' + error);
    }

    vimeoLog('api request', api_url, response.headers);

    if (!error && response.statusCode == 200) {
      var jsonData = JSON.parse(response.body);

      if (!__util.isEmptyObject(jsonData) && !__util.isEmptyObject(jsonData.files)) {
        callback(jsonData);

      } else {
        callback({});
      }

    } else {
      callback({});
    }
  });
};

var completevideo = function (req, res, next) {
  var obj = req.body.form_data;

  _vimeoComplete(obj, function (result) {
    res.send(result);
  });
};

var vimeoDeleteVideo = function (req, res, next) {
  var _id = req.params.id;
  var videoId = req.params.videoId;

  vimeoDelete(videoId, function (result) {
    var vQuery = {};
    var vOptions = {};
    vQuery["_id"] = _id;

    videoDelete(vQuery, function (deleteResult) {
      res.send(result);
    });
  });
};

var vimeoAppSave = function (req, res, next) {
  try {
    var obj = req.body.form_data;
    var postData = {};

    if (!__util.isEmptyObject(obj.data)) {
      postData = JSON.parse(obj.data);
      postData["videoId"] = obj.videoId;

      $media.save(postData, function (result) {
        if (!result.status) {
          $log.error('vimeo save error: not saved');
        }

        res.send(result);
      });

    } else {
      var result = { "status": false };
      result["message"] = "Invalid Request"

      res.send(result);
    }
  }
  catch (err) {
    $log.error('vimeo save error: ' + err + ' =======data: ' + req.body.form_data);

    var result = { "status": false };
    result["message"] = "Invalid Request"

    res.send(result);
  }
};

var save = function (req, res, next) {
  var obj = req.body.form_data;

  _saveVimeo(obj, function (result) {
    res.send(obj);
  });
};

var keys = function (req, res, next) {
  query = {};
  options = {};
  query.organizationId = req.params.orgId;

  $db.select(videoConf.dbname, videoConf.auth, videoConf.collections.video, query, options, function (result) {
    res.send(result);
  });
};

var vimeoLog = function (title, url, header, callback) {
  var obj = {}
  var currentDate = new Date();
  currentDate = new Date(currentDate).toUTCString();
  var dateTime = new Date(currentDate);
  obj.title = title;
  obj.datetime = dateTime;
  obj.url = url;
  obj.header = header;

  $db.save(videoConf.dbname, videoConf.auth, videoConf.collections.vimeoLog, obj, function (result) {
    obj._id = result;

    if (callback) {
      callback(obj);
    }
  });
};

var videoJson = function (req, res, next) {
  $async.waterfall([
    function (callback) {
      let mediaQuery = {};
      options = {};
      mediaQuery.vimeoId = req.params.videoId;

      videoById(mediaQuery, options, function (video) {
        callback(null, video);
      });
    },
    function (video, callback) {
      let obj = video.length > 0 ? video[0] : {};
      let vData = _getVimeoGet(obj, req.params.videoId)

      if (__util.isEmptyObject(vData.album)) {
        let videoId = req.params.videoId.indexOf(":") !== -1 ? req.params.videoId.split(":")[0] : req.params.videoId;

        vimeoRequest(videoId, function (response) {
          callback(null, response, true);
        });
      } else {
        callback(null, obj, false);
      }
    },
  ], function (err, jsonData, isUpdate) {
    if (isUpdate) {
      query = {};
      options = {};
      query.vimeoId = req.params.videoId;

      var obj = {};
      obj["vimeoData"] = jsonData;

      videoUpdate(query, options, obj, function (result) {
        res.send(_getVimeoGet(obj, req.params.videoId));
      });

    } else {
      res.send(_getVimeoGet(jsonData, req.params.videoId));
    }
  });
};

var videoById = function (query, options, callBack) {
  $db.select(videoConf.dbname, videoConf.auth, videoConf.collections.video, query, options, function (result) {
    callBack(result);
  });
};

var videoDelete = function (query, options, callBack) {
  $db.remove(videoConf.dbname, videoConf.auth, videoConf.collections.video, query, options, function (result) {
    callBack(result);
  });
};

var videoUpdate = function (query, options, dataToUpdate, cb) {
  $db.update(videoConf.dbname, videoConf.auth, videoConf.collections.video, query, options, dataToUpdate, function (result) {
    cb(result);
  });
};

var vimeoDelete = function (videoId, cb) {
  lib.request({
    method: "delete",
    path: "/videos/" + videoId,
  }, function (err, response, body, header) {
    var result = {};

    if (!err) {
      result = { "status": true };
    } else {
      var result = { "status": false };
      result["message"] = "Invalid Request"
    }

    cb(result);
  });
};

var imageComplete = function (url, callback) {
  var api_url = "https://api.vimeo.com" + url;

  var options = {
    method: 'PATCH',
    url: api_url,
    json: {
      active: true
    },
    body: {
      active: true
    },
    headers: {
      Accept: "application/vnd.vimeo.*+json;version=3.2",
      Authorization: 'Bearer ' + videoConf.VimeoAccessToken,
      'User-Agent': 'Vimeo.js/1.2.0'
    }
  };

  request(options, function (error, response, body) {
    if (error) {
      $log.error('vimeo request url: ' + api_url);
      $log.error('vimeo request: ' + error);
    }
    if (!error && response.statusCode == 200) {
      if (!__util.isEmptyObject(body)) {
        callback(body);
      } else {
        callback({});
      }
    } else {
      callback({});
    }
  });
};

var _vimeoComplete = function (obj, cb) {
  var organizationId = obj.organizationId;
  var url = obj.path;

  lib.request({
    method: obj.method,
    path: obj.path,
  }, function (err, response, body, header) {
    var vimeoId = header.location.replace(/\/videos\//, '');

    obj = {};
    obj.vimeoId = vimeoId;
    obj.organizationId = organizationId;
    obj.source = 'studio';
    vimeoLog('video complete request', url, {});

    if (!err) {
      _saveVimeo(obj, function (obj) {
        cb(obj);
      });
    }
  });
};

var _createVideoUpload = function () {
  var key = "gN41JMKZ";
  var dateTime = parseInt((new Date()).getTime() / 1000);
  var nonce = Math.floor(00000000 + Math.random() * 99999999);

  var api_url = "http://api.bitsontherun.com/v1/videos/create?";
  var api_params = "api_format=json";
  api_params += "&api_key=" + key;
  api_params += "&api_nonce=" + nonce;
  api_params += "&api_timestamp=" + dateTime;
  api_url += api_params;

  var hash = require('crypto').createHash('sha1').update(api_params + "8jSm7y0UPvcdWI0vgyD6XJ7W").digest('hex');
  api_url += "&api_signature=" + hash;

  return api_url;
};

var _randomValueHex = function (len) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex')// convert to hexadecimal format
    .slice(0, len);
  // return required number of characters
};

var _saveVimeo = function (obj, cb) {
  $db.save(videoConf.dbname, videoConf.auth, videoConf.collections.video, obj, function (result) {
    obj._id = result;
    cb(obj);
  });
};

var _getVimeoGet = function (obj, videoId) {
  var returnObj = {};
  returnObj.album = "";
  returnObj.url = "";

  if (!__util.isEmptyObject(obj.vimeoData)) {
    var vimeoData = obj.vimeoData;
    var pictures = vimeoData && vimeoData.pictures ? vimeoData.pictures : {};
    var streamUrls = vimeoData && vimeoData.files ? vimeoData.files : [];

    if (pictures.sizes && pictures.sizes.length > 0) {
      returnObj.album = pictures.sizes[pictures.sizes.length - 1].link;
    }

    if (streamUrls && streamUrls.length > 0) {
      var sdVideos = _.where(streamUrls, { quality: "sd" });

      if (sdVideos.length > 0) {
        var stream = _.min(streamUrls, function (stream) { return stream.size; });

        if (stream) {
          returnObj.url = stream.link;
        }
      } else {
        returnObj.url = streamUrls[0].link;
      }
    }
  }

  returnObj.videoId = videoId;

  return returnObj;
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
  "vimeoAppSave": vimeoAppSave,
  "upload": upload,
  "list": list,
  "vimeocreate": vimeocreate,
  "save": save,
  "keys": keys,
  "vimeoJson": vimeoJson,
  "completevideo": completevideo,
  "vimeoDeleteVideo": vimeoDeleteVideo,
  "pictureUpload": pictureUpload,
  "videoJson": videoJson
}
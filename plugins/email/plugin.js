var nodemailer = require("nodemailer");

var smtpTransport;
var settingsConf;
var options = {};
var query = {};

//var event = require(path.join(process.cwd(), 'models', 'event'));

var init = function (app) {
  settingsConf = app.get('settings');
  
  console.dir(settingsConf.email.smtpserver);

  smtpTransport = nodemailer.createTransport({
    host: settingsConf.email.smtpserver,
    port: settingsConf.email.smtpport,
    auth: {
      user: settingsConf.email.mailusername,
      pass: settingsConf.email.mailpassword
    }
  });
};

var send = function (req, res, next) {
  var mailOptions = {};

  if (!__util.isNullOrEmpty(req.body.form_data)) {
    mailOptions = req.body.form_data;
  }

  $async.waterfall([
    function (cb) {

      if (!__util.isEmptyObject(mailOptions.memberId)) {
        $async.parallel({
          member: function (callback) {
            query = {};
            query._id = mailOptions.memberId;
            options = {};

            $member._getMember(query, options, function (result) {
              callback(null, result);
            });
          },
          profile: function (callback) {
            var language = "en";
            var url = settingsConf.authDomain + '/migrate/get_org_structure/' + mailOptions.orgId + '/' + language;
            var options = {
              url: url,
              method: "GET"
            };

            $general.getUrlResponseWithSecurity(options, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                callback(null, JSON.parse(body));

              } else {
                callback(null, []);
              }
            });
          },
          memberblockdata: function (callback) {
            var member = {};
            member.memberId = mailOptions.memberId;
            member.appId = mailOptions.appId;
            member.type = "account";
            var memberOptions = {};
            memberOptions.sort = [['_id', -1]];

            member = $general.getObjectIdByQuery(member);

            $memberblockdata._blockData(member, memberOptions, function (memberBlockData) {
              if (memberBlockData.length > 0) {
                callback(null, memberBlockData[0]);

              } else {
                callback(null, {});
              }
            });
          },
        }, function (err, results) {
          cb(null, results);
        });

      } else {
        cb(null, { member: [], profile: [], memberblockdata: [] });
      }
    },
    function (results, cb) {
      var profileData = {};
      var memberHtml = '';
      var memberData = {};

      if (!__util.isEmptyObject(results.member) && results.member.length > 0 && __util.isNullOrEmpty(mailOptions.shareEmail)) {
        memberData = results.member[0];
        profileData = _getProfileHtml(results.profile, memberData);
        memberHtml = profileData.html;
      }

      if (!__util.isNullOrEmpty(profileData.isProfile) && !profileData.isProfile) {
        if (!__util.isEmptyObject(results.memberblockdata.data)) {
          profileData = _getConnectionHtml(results.profile, results.memberblockdata.data);
          memberHtml = profileData.html;
        }

        cb(null, memberData, results.profile, profileData, memberHtml);

      } else {
        cb(null, memberData, results.profile, profileData, memberHtml);
      }
    },
    function (memberData, profile, profileData, memberHtml, cb) {
      if (!__util.isNullOrEmpty(mailOptions.shareEmail)) {
        delete mailOptions["shareEmail"];

        /*if (!__util.isEmptyObject(memberData)) {
         memberHtml += memberData && !__util.isNullOrEmpty(memberData.firstName) ? memberData.firstName : "" + "<br/>";
         }*/
      }

      if (!__util.isEmptyObject(memberData.login) && !__util.isNullOrEmpty(memberData.login[0].email) && __util.isNullOrEmpty(mailOptions.from)) {
        mailOptions.from = memberData.login[0].email;

      } else if (__util.isNullOrEmpty(mailOptions.from)) {
        mailOptions.from = settingsConf.email.fromsmtpaddress;
      }

      if (!__util.isNullOrEmpty(mailOptions.type) && mailOptions.type == "contactus") {
        mailOptions.html = mailOptions.data.body + "<br/><br/>" + memberHtml;
        mailOptions.subject = mailOptions.data.subject;
        mailOptions.to = mailOptions.data.to;

      } else {
        mailOptions.html = mailOptions.html + "<br/><br/>" + memberHtml;
      }

      var inqInfoData = {};
      var inqObj = {};

      if (!__util.isEmptyObject(mailOptions.inquiryInfo)) {
        var inqMemberBlockId = !__util.isEmptyObject(mailOptions.inquiryInfo._id) ? mailOptions.inquiryInfo._id : "";

        inqInfoData = profileData.data ? profileData.data : {};
        inqInfoData["inquiryText"] = !__util.isEmptyObject(mailOptions.inquiryInfo.inquiryText) ? mailOptions.inquiryInfo.inquiryText : "";

        inqObj.tileId = mailOptions.inquiryInfo.tileId;
        inqObj.title = mailOptions.inquiryInfo.title;

        if (!__util.isEmptyObject(inqMemberBlockId)) {
          inqObj._id = inqMemberBlockId;
        }

        inqObj.tileBlockId = mailOptions.inquiryInfo.tileBlockId;
        inqObj.memberId = mailOptions.inquiryInfo.memberId;
        inqObj.appId = mailOptions.inquiryInfo.appId;
        inqObj.type = mailOptions.inquiryInfo.type;
        inqObj.data = inqInfoData;
        inqObj.dynamicProfile = profile;

        if (!__util.isNullOrEmpty(mailOptions.inquiryInfo.updatedDate)) {
          inqObj.updatedDate = $general.stringToDate(mailOptions.inquiryInfo.updatedDate);
        }
      }

      cb(null, mailOptions, inqObj);

    }], function (error, mailOptions, enquiryObj) {
      if (!__util.isNullOrEmpty(mailOptions.to)) {
        smtpTransport.sendMail(mailOptions, function (error, response) {

          obj = {};
          obj.result = true;

          if (error) {
            obj.result = false;
            obj.error = error.message;

          } else if (!__util.isEmptyObject(mailOptions.inquiryInfo)) {
            $memberblockdata._saveMemberBlockData($general.getObjectIdByQuery(enquiryObj), function (result) {
            });

          } else if (!__util.isNullOrEmpty(mailOptions.type) && mailOptions.type == "contactus") {
            delete mailOptions["to"];
            delete mailOptions["subject"];
            delete mailOptions["html"];
            delete mailOptions["transport"];

            if (!__util.isNullOrEmpty(mailOptions.updatedDate)) {
              mailOptions.updatedDate = $general.stringToDate(mailOptions.updatedDate);
            }

            $memberblockdata._saveMemberBlockData($general.getObjectIdByQuery(mailOptions), function (result) {
            });
          }

          res.send(obj);
        });

      } else {
        obj = {};
        obj.result = false;
        obj.error = "Can't send mail - no recipients defined!!!";

        res.send(obj);
      }
    });
};

var _getProfileHtml = function (fields, memberData) {
  var memberHtml = "<p><b>Profile :</b></p>";
  var profile = {};
  var proObj = {};
  var isProfile = false;

  _.each(fields, function (field) {
    var blockValue = "";
    if (field.tag !== "password") {
      if (field.tag == "email") {
        blockValue = memberData && !__util.isEmptyObject(memberData.login) && !__util.isNullOrEmpty(memberData.login[0]["email"]) ? memberData.login[0]["email"] : "";

        if (__util.isNullOrEmpty(blockValue)) {
          blockValue = memberData && !__util.isEmptyObject(memberData) && !__util.isNullOrEmpty(memberData[field.tag]) ? memberData[field.tag] : "";
        }
      } else {
        blockValue = memberData && !__util.isEmptyObject(memberData) && !__util.isNullOrEmpty(memberData[field.tag]) ? memberData[field.tag] : "";
      }

      if (!__util.isNullOrEmpty(blockValue)) {
        memberHtml += field.name + ": " + blockValue + "<br/>";
        proObj[field.tag] = blockValue;
        isProfile = true;
      } else {
        if (isProfile == false) {
          isProfile = false;
        }
      }
    }
  });

  profile.data = proObj;
  profile.html = memberHtml;
  profile.isProfile = isProfile;

  return profile;
};

var _getConnectionHtml = function (fields, memberData) {
  var memberHtml = "<p><b>Profile :</b></p>";
  var profile = {};
  var proObj = {};
  var isProfile = false;

  _.each(fields, function (field) {
    var blockValue = "";
    if (field.tag !== "password") {
      blockValue = memberData && !__util.isEmptyObject(memberData) && !__util.isNullOrEmpty(memberData[field.tag]) ? memberData[field.tag] : "";

      if (!__util.isNullOrEmpty(blockValue)) {
        memberHtml += field.name + ": " + blockValue + "<br/>";
        proObj[field.tag] = blockValue;
      }
    }

    isProfile = true;
  });

  if (!isProfile) {
    memberHtml = "";
  }

  profile.data = proObj;
  profile.html = memberHtml;

  return profile;
};

module.exports = {
  "init": init,
  "send": send,
  "_getProfileHtml": _getProfileHtml
}
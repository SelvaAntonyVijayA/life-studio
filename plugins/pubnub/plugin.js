var appconf, pubnubConf, settingsConf;
var query = {};
var options = {};
var pnChannels = require("./pubnub.js");
var pubnub;


/*var pubnub = require("pubnub")({
  publish_key : "pub-c-e0c613ed-52bf-46d9-9160-858e674bfc26",
  subscribe_key : "sub-c-ed7b1d70-9d0c-11e5-b0f3-02ee2ddab7fe",
  secret_key : "sec-c-MTc4M2YyYjAtZDc2ZC00MDBiLWFhZTktZTdkMGVmNzk1NzAz"
});*/

var init = function (app) {
  settingsConf = app.get('settings');
  // appconf = __conf.get("app");
  //pubnubConf = __conf.get("pubnub");
  pnChannels.createPubnubChannel();
};

var getChatBannedByUser = function (pQuery, pOptions, cb) {
  $db.select(settingsConf.dbname.tilist_core, settingsConf.collections.bannedusers, pQuery, pOptions, function (result) {
    if (cb) {
      cb(result);
    }
  });
};

var updateBannedUser = function (banQuery, pOptions, updateData, cb) {
  $db.update(settingsConf.dbname.tilist_core, settingsConf.collections.bannedusers, banQuery, pOptions, updateData, function (result) {
    if (cb) {
      cb(result);
    }
  });
};

module.exports = {
  "init": init,
  "getChatBannedByUser": getChatBannedByUser,
  "updateBannedUser": updateBannedUser
};
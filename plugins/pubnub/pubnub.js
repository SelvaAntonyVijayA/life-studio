var pubnubChannels = {};
var PubNub = require('pubnub');

var createPubnubChannel = function () {
    var pubnubKeys = getPubnubKeys();

    for (var key in pubnubKeys) {
        if (pubnubKeys.hasOwnProperty(key)) {
            pubnubChannels[key] = new PubNub((pubnubKeys[key]));
        }
    }
};

var getPubnubChannel = function (appId) {
    if (pubnubChannels[appId]) {
        return pubnubChannels[appId];

    } else {
        return pubnubChannels["default"];
    }
};

var getChannelKeys = function (appId) {
    var pubnubKeys = getPubnubKeys();

    if (pubnubKeys[appId]) {
        return pubnubKeys[appId];

    } else {
        return pubnubKeys["default"];
    }
};

var getPubnubKeys = function () {
    var pubnubKeys = {
		/*"546c35dc41278ffc2f000095" : {
				publish_key : "pub-c-2e5d39bf-9e49-4cb5-9b9f-ae822de576c2",
				subscribe_key : "sub-c-7d0db0b8-a0e7-11e6-8f64-0619f8945a4f",
				secret_key : "sec-c-N2I0NDUyMTUtMTY0NS00YmRlLTgxMWYtYjU3N2I3MzczOWIw"
		},
		"56fd5d997c6a8496777be5e1": {
			publishKey: "pub-c-e461dff8-9339-4bc5-8b28-1e6789c596fd",
			subscribeKey: "sub-c-ca16c41c-b186-11e6-a7bb-0619f8945a4f",
			secretKey: "sec-c-YjM0MGIwMmEtZjkzZS00Y2Y0LTg4OWUtNDkyN2IwYWFhZjAz"
		},*/
        "default": {
            publishKey: "pub-c-32fcdafa-5857-48e1-9860-b9abcbd7ecf3",
            subscribeKey: "sub-c-bdcc1cf8-74d1-11e6-b4bc-02ee2ddab7fe",
            secretKey: "sec-c-MDRlMWMyYTktMTU3Ni00MzM4LWEwNWItYzY1OTdhNjYwNWYz",
            ssl: true
        }
    };

    return pubnubKeys;
};

module.exports = {
    "createPubnubChannel": createPubnubChannel,
    "getPubnubChannel": getPubnubChannel,
    "getChannelKeys": getChannelKeys
};
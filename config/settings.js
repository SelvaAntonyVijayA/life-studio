module.exports = {
  "name": "Tilist",
  "dbhost": "ec2-54-87-188-83.compute-1.amazonaws.com",
  "dbport": "27017",
  "dbnames": ["tilist-core", "tilist-users", "tilist-service"],
  "dbauth": {
    "tilist-core": {
      "user": "ilroot",
      "password": "M@tsy@2011"
    },
    "tilist-users": {
      "user": "ilroot",
      "password": "M@tsy@2011"
    },
    "tilist-service": {
      "user": "ilroot",
      "password": "MatsyA2018"
    }
  },
  "domain": "http://localhost:8080",
  "authDomain": "http://staging.interactivelife.me",
  "dbname": {
    "tilist_core": "tilist-core",
    "tilist_users": "tilist-users",
    "tilist_service": "tilist-service"
  },
  "collections": {
    "access": "access",
    "approles": "approles",
    "apps": "apps",
    "settings": "pagesettings",
    "cart": "cart",
    "domains": "domains",
    "engines": "engines",
    "eventCategory": "eventcategory",
    "procedureCategory": "procedureCategory",
    "hsrengine": "hsrengine",
    "integration": "integration",
    "integrationtype": "integrationtype",
    "integrationwidgets": "integrationwidgets",
    "languages": "languages",
    "livestream": "livestream",
    "streammapping": "streammapping",
    "purchasedemoticons": "purchasedemoticons",
    "channelCategory": "channelcategory",
    "location": "location",
    "media": "media",
    "memberblockdata": "memberblockdata",
    "answeredtiles": "answeredtiles",
    "survey_data": "survey_data",
    "contactHistory": "contacthistory",
    "patientNotes": "patientNotes",
    "menus": "menus",
    "notifyjobs": "notifyjobs",
    "notification": "notification",
    "gcm": "gcm",
    "apns": "apns",
    "notificationLog": "notificationLog",
    "tracknotification": "tracknotification",
    "notificationhistory": "notificationhistory",
    "organization": "organization",
    "organizationtype": "organizationtype",
    "package": "package",
    "orgpackage": "orgpackage",
    "totaltileclicks": "totaltileclicks",
    "page": "page",
    "pagetheme": "pagetheme",
    "pagepermissions": "pagepermissions",
    "physician": "physician",
    "assign_physician_clinic": "assign_physician_clinic",
    "bannedusers": "bannedusers",
    "qaweights": "qaweights",
    "reportrule": "reportrule",
    "trendalert": "trendalert",
    "tileclicks": "tileclicks",
    "smartengine": "smartengine",
    "streamstudio": "streamstudio",
    "tile": "tile",
    "tileBlocks": "tileblocks",
    "tileCategory": "tilecategory",
    "widgetCategory": "widgetcategory",
    "tileLanguage": "tileLanguage",
    "googlefonts": "googlefonts",
    "tilestatus": "tilestatus",
    "tiletheme": "tiletheme",
    "event": "event",
    "catilist": "catilist",
    "tilist": "tilist",
    "procedure": "procedure",
    "memberproceduremapping": "memberproceduremapping",
    "tilisttheme": "tilisttheme",
    "orgmembers": "orgmembers",
    "members": "members",
    "preferredlocation": "preferredlocation",
    "userapp": "userapp",
    "userlocation": "userlocation",
    "role": "role",
    "video": "video",
    "vimeoLog": "vimeolog",
    "widgets": "widgets",
    "newjobs": "newjobs",
    "moderatortilemapping": "moderatortilemapping"
  },
  "email": {
    "smtpserver": "smtp.emailsrvr.com",
    "fromsmtpaddress": "info@interactivelife.com",
    "mailusername": "support@myquu.com",
    "mailpassword": "MyQuu2oo9",
    "smtpport": "8025"
  },
  "log": {
    "critical": true,
    "error": true,
    "debug": false,
    "warn": false,
    "info": false,
    "store": "files",
    "filepath": "log/tilist.log"
  },
  "blog": {
    "client_id": 42666,
    "client_secret": "fFarvqtHIDU6R71PWQP9pdoqmnyev4JamGZnL5PTsNlNJsjWRVaEpwBd2ry6o0NC",
    "redirect_url": "/blog/response",
    "request_token_url": "https://public-api.wordpress.com/oauth2/token",
    "authenticate_url": "https://public-api.wordpress.com/oauth2/authorize"
  },
  "datamigration": {
    "appUrl": "/migrate/structure",
    "userBulkUrl": "/migrate/data",
    "userUrl": "/migrate/user"
  },
  "media": {
    "vote_count": "/presence/batch/percentage_total/",
    "view_count": "/presence/batch/total/"
  },
  "inapppurchase": {
    "keyPassword": "Inter@ctIvel!fe@0!%",
    "androidPublicKeyPath": "/android/",
    "algorithm": "aes-256-cbc"
  },
  "notification": {
    "gcmkey": "AIzaSyBVBF_VWmyWo3966WZUfYv0m0-8hcRCKCQ",
    "apnsauth": "public/apns/"
  },
  "pubnubKeys": {
    "56fd5d997c6a8496777be5e1": {
      "publishKey": "pub-c-e461dff8-9339-4bc5-8b28-1e6789c596fd",
      "subscribeKey": "sub-c-ca16c41c-b186-11e6-a7bb-0619f8945a4f",
      "secretKey": "sec-c-YjM0MGIwMmEtZjkzZS00Y2Y0LTg4OWUtNDkyN2IwYWFhZjAz"
    },
    "default": {
      "publishKey": "pub-c-e0c613ed-52bf-46d9-9160-858e674bfc26",
      "subscribeKey": "sub-c-ed7b1d70-9d0c-11e5-b0f3-02ee2ddab7fe",
      "secretKey": "sec-c-MzdjNmI2OWMtNTk4Ni00ZGYzLWJjY2YtMmJlMmViZGNlNzJh"
    }
  },
  "vimeo": {
    "videofolderpath": "public/video/orgs/{0}/",
    "videourlpath": "/video/orgs/{0}/",
    "VimeoClientId": "84cf039e7d9af5955213f8d1ba4d786a711bbf83",
    "VimeoAccessToken": "153f95578e67a79348676dc229ecddbf",
    "VimeoClientSecret": "wgs8oftje+wbC+t/21EuJsc2aekPgF1srmKLoBah9HKbAoCfiRvNvySYzxx9BVdyCRkfn9AWxZ8WwoxJ5P/hNp5HJp/clL4KnIXzjmBTHFJWw1QHCKBPwYWOOECAMWlA"
  },
  "jwt": {
    "secretKey": "b4083c7032a419bb4a84ce53426c6bbe"
  },
  "cachelog": {
    "folderPath": "/apps/tilist/cachelog"
  },
  "general": {
    "mobileSecurityKey": "mretFFc7OXNAos2yXyiHsdVGZqqj5ZoZgjcZvlvSWYHVOut1"
  },
  "web": {
    "host": "localhost",
    "port": 8080
  },
  "path": "C://ili/angular/src/assets/",
  "folderPath": "C:/ili/angular/src/assets/img/orgs/",
  "image": {
    "imgfolderpath": "img/orgs/{0}/",
    "imgurlpath": "/img/orgs/{0}/",
    "imgAppFolderPath": "img/apps/{0}/{1}/",
    "imgDefaultThemeFolderPath": "img/apps/{0}/{1}/",
    "imgAppUrlPath": "/img/apps/{0}/{1}/",
    "tileImagefolder": "img/tile/{0}/",
    "tileImageUrl": "/img/tile/{0}/{1}/",
    "imgBgFolderPath": "img/apps/{0}/",
    "imgBgDefaultFolderPath": "img/apps/defaultTheme/{0}/",
    "imgBgDefaultMenuUrlPath": "/img/apps/defaultTheme/{0}/{1}/",
    "imgGroupFolderPath": "img/groups/{0}/{1}/",
    "imgGroupUrlPath": "/img/groups/{0}/{1}/",
    "imgEmoticonsFolderPath": "img/emoticons/{0}/",
    "imgEmoticonsUrlPath": "/img/emoticons/{0}/",
    "imgProfileFolderPath": "img/profile/{0}/",
    "imgProfileUrlPath": "/img/profile/{0}/",
    "imgStreamFolerPath": "img/streams/{0}/",
    "imgStreamUrlPath": "/img/streams/{0}/",
    "imgFormPhotoFolderPath": "img/formphotos/{0}/",
    "imgFormPhotoUrlPath": "/img/formphotos/{0}/",
    "imgStreamCrownUrlPath": "/img/streams/{0}/{1}/"
  }
}
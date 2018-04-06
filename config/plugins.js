var plugins = {
  "user": "user",
  "general": "general",
  "organization": "organization",
  "organizationtype": "organizationtype",
  "access": "access",
  "role": "role",
  "authtoken": "authtoken",
  "domains": "domains",
  "tile": "tile",
  "tileblock": "tileblock",
  "tilecategory": "tilecategory",
  "event": "event",
  "page": "page",
  "eventcategory": "eventcategory",
  "languages": "languages",
  "tilist": "tilist",
  "catilist": "catilist",
  "theme": "theme",
  "procedure": "procedure",
  "tilestatus": "tilestatus",
  "healthstatusrules": "healthstatusrules",
  "member": "member",
  "memberblockdata": "memberblockdata",
  "db": "database",
  "image": "image",
  "package": "package",
  "apps": "apps",
  "location": "location",
  "integration": "integration",
  "integrationtype": "integrationtype",
  "integrationwidgets": "integrationwidgets",
  "languages": "languages",
  "organization": "organization",
  "organizationtype": "organizationtype",
  "livestream": "livestream",
  "pagesettings": "pagesettings",
  "log": "log",
  "datamigration": "datamigration",
  "engines": "engines",
  "notification": "notification",
  "smartengine": "smartengine"
};

module.exports = function (appPath, dirName, app) {
  var plugsPath = appPath.join(dirName, 'plugins');
  var pluginKeys = _.keys(plugins);

  _.each(pluginKeys, function (name, index) {
    var ctrlPlugin = require(appPath.join(plugsPath, plugins[name], 'plugin'));
    var aliasName = "$" + name;
    global[aliasName] = ctrlPlugin;

    if (global[aliasName].hasOwnProperty('init')) {
      global[aliasName].init(app);
    }

    console.log('Plugin ' + name + ' is loaded available with name $' + name);
  });
};
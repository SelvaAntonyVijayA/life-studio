var plugins = {
  "user": "user",
  "general": "general",
  "organization": "organization",
  "role": "role",
  "authtoken": "authtoken",
  "domains": "domains",
  "tile": "tile",
  "tileblock": "tileblock",
  "tilecategory": "tilecategory",
  "event": "event",
  "page": "page",
  "eventcategory": "eventcategory",
  "db": "database"
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
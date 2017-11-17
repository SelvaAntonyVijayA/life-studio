var pluginNames = ["user", "general", "organization", "role", "authtoken",
  "domains", "tile", "tileblock", "tilecategory", "event", "page", "eventcategory"];

module.exports = function (appPath, dirName, app) {
  var plugsPath = appPath.join(dirName, 'plugins');

  _.each(pluginNames, function (name, index) {
    var ctrlPlugin = require(appPath.join(plugsPath, name, 'plugin'));
    var aliasName = "$" + name;
    global[aliasName] = ctrlPlugin;

    if (global[aliasName].hasOwnProperty('init')) {
      global[aliasName].init();
    }
    console.log('Plugin ' + name + ' is loaded available with name $' + name);
  });
};
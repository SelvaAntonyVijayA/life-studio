module.exports = function (mongoose, app) {
  var databaseNames = app.get('settings').dbnames;

  var options = {
    server: { poolSize: 50 },
    db: { native_parser: false }
  };

  _.each(databaseNames, function (dbName, index) {
    var dbAuth = app.get('settings').dbauth[dbName];
    var dbHost = app.get('settings').dbhost;
    var dbPort = app.get('settings').dbport;

    options["user"] = dbAuth.user;
    options["pass"] = dbAuth.password;

    if (global.hasOwnProperty(dbAuth.name)) {
      global[dbAuth.name].close();
    }

    global[dbAuth.name] = mongoose.createConnection('mongodb://' + dbHost + ':' + dbPort + '/' + dbName, options);

    global[dbAuth.name].on('error', function () {
      console.log('Error! Database ' + dbName + ' connection failed.');
    });

    global[dbAuth.name].once('open', function (argument) {
      console.log('Database ' + dbName + ' connection established!');
    });
  });
};
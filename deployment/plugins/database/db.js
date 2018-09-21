const mongo = require("mongodb");
global.db = [];

/* Create Connection for all the databases */
var createConnection = function (app) {
  const appconf = app.get('settings');
  const mongoClient = require('mongodb').MongoClient;
  const f = require('util').format;

  _.each(appconf.dbnames, function (dbname) {
    var user = encodeURIComponent(appconf.dbauth[dbname].user),
      password = encodeURIComponent(appconf.dbauth[dbname].password),
      authMechanism = 'DEFAULT',
      authSource = dbname;

    // connection url
    var url = f('mongodb://%s:%s@%s:%s/?authMechanism=%s&authSource=%s',
      user, password, appconf.dbhost, appconf.dbport, authMechanism, authSource);

    mongoClient.connect(url, function (err, database) {
      if (err) {
        console.error("DB connection error :" + err);
      }

      if (database) {
        db[dbname] = database.db(dbname);
        console.log('Database ' + dbname + ' connection established!');
      }
    });
  });
};

var _objectId = function (_id) {
  if (_validateId(_id)) {
    return new mongo.ObjectID(_id);

  } else {
    return _id;
  }
};

var exec = function (dbname, table, query, options, fn, cb, data) {
  /*
   var connection = _createConnection(dbname);
 
   connection.open(function(error, db) {
   if (error) {
   $log.critical(error.stack);
   return;
   }*/

  /*
   db[dbname].authenticate(auth.user, auth.password, function(error, isAuth) {
   if (isAuth) {*/

  if (db[dbname]) {
    db[dbname].collection(table, function (error, collection) {
      if (error) {
        cb(error);
      }
      try {
        fn(collection, query, options, function (error, result) {
          if (error) {
            cb(error);
          }

          //db.close();
          cb(null, result);
        }, data);
      } catch (e) {
        console.error(e.stack);
      }
    });

  } else {
    cb(null, []);
  }

  //});
};

var save = function (collection, query, options, cb, data) {
  if (_validateId(data._id)) {
    data._id = new mongo.ObjectID(data._id);

  } else {
    delete data["_id"];
  }

  collection.save(data, {
    safe: true
  }, function (error, doc) {
    if (error) {
      cb(error);
    }

    if (!__util.isNullOrEmpty(doc._id)) {
      cb(null, doc._id);
    } else {
      cb(null, data._id);
    }
  });
};

var update = function (collection, query, options, cb, data) {
  try {
    if (_validateId(query._id)) {
      query._id = new mongo.ObjectID(query._id);
    }
    delete data["_id"];
    collection.update(query, (data.$addToSet || data.$push || data.$pushAll || data.$pull || data.$pullAll || data.$inc || data.$setOnInsert ? data : {
      $set: data
    }), options, function (error, doc) {
      if (error) {
        cb(error);
      }

      if (doc == 1) {
        if (__util.isNullOrEmpty(options.multi)) {
          cb(null, query._id);
        } else {
          cb(null, true);
        }
      } else {
        cb(null, false);
      }
    });
  } catch (e) {
    cb(e, false);
  }
};

var select = function (collection, query, options, cb) {
  if (typeof query._id == "object" && query._id.length > 1) {
    var $in = [];

    _.each(query._id, function (id) {
      if (_validateId(id)) {
        $in.push(mongo.ObjectID(id));
      }
    });

    query._id = {};
    query._id.$in = $in;
  } else {
    var id = "";
    if (typeof query._id == "object") {
      id = query._id[0];
    } else {
      id = query._id;
    }
    if (_validateId(id)) {
      query._id = new mongo.ObjectID(id);
    }
  }

  if (options.limit) {
    var countLimit = options.limit;
    delete options["limit"];

    collection.find(query, options).limit(countLimit).toArray(function (error, result) {
      if (error) {
        cb(error);
      }

      cb(null, result);
    });

  } else {
    collection.find(query, options).toArray(function (error, result) {
      if (error) {
        cb(error);
      }

      cb(null, result);
    });
  }
};

var selectSpecificFields = function (collection, query, options, cb, fields) {
  if (typeof query._id == "object" && query._id.length > 1) {
    var $in = [];

    _.each(query._id, function (id) {
      if (_validateId(id)) {
        $in.push(mongo.ObjectID(id));
      }
    });

    query._id = {};
    query._id.$in = $in;
  } else {
    var id = "";
    if (typeof query._id == "object") {
      id = query._id[0];
    } else {
      id = query._id;
    }
    if (_validateId(id)) {
      query._id = new mongo.ObjectID(id);
    }
  }

  collection.find(query, fields, options).toArray(function (error, result) {
    if (error) {
      cb(error);
    }

    cb(null, result);
  });
};

var remove = function (collection, query, options, cb) {
  if (typeof query._id == "object" && query._id.length > 1) {
    var $in = [];

    _.each(query._id, function (id) {
      if (_validateId(id)) {
        $in.push(mongo.ObjectID(id));
      }
    });

    query._id = {};
    query._id.$in = $in;

  } else {
    var id = "";

    if (typeof query._id == "object") {
      id = query._id[0];
    } else {
      id = query._id;
    }

    if (_validateId(id)) {
      query._id = new mongo.ObjectID(id);
    }
  }

  collection.remove(query, options, function (error) {
    if (error) {
      cb(error);
    }

    cb(null, true);
  });
};

var join = function (collection, query, options, cb) {
  collection.aggregate(query, function (error, result) {
    if (error) {
      cb(error);
    }

    cb(null, result);
  });
};

var _createConnection = function (dbname) {
  var appconf = __conf.get('app');
  var serverOptions = {
    socketOptions: {
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000
    }
  };

  var server = new mongo.Server(appconf.dbhost, '27017', serverOptions);
  var db = new mongo.Db(dbname, server, {
    safe: true
  });

  return db;
};

var _validateId = function (id) {
  if (!__util.isNullOrEmpty(id) && (id.length == 12 || id.length == 24)) {
    return true;
  }

  return false;
};

module.exports = {
  "createConnection": createConnection,
  "_objectId": _objectId,
  "exec": exec,
  "save": save,
  "update": update,
  "select": select,
  "selectSpecificFields": selectSpecificFields,
  "remove": remove,
  "join": join
};

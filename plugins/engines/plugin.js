var engineConf;
var query = {};
var options = {};

exports.init = function() {
  engineConf = __conf.get("engines");
};

exports.save = function(context) {
  var obj = JSON.parse(context.data.form_data);

  $db.save(engineConf.dbname, engineConf.auth, engineConf.collections.engines, obj, function(result) {
    obj = {};
    obj._id = result;

    $general.returnJSON(context, obj);
  });
};

exports.list = function(context) {
  query = {};
  options = {};
  options.sort = [['name', 'asc']];

  $db.select(engineConf.dbname, engineConf.auth, engineConf.collections.engines, query, options, function(result) {
    $general.returnJSON(context, result);
  });
};

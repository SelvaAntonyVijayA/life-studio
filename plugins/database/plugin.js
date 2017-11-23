// require('newrelic');
var db = require("./db.js");

var init = function (app) {
	db.createConnection(app);
};

var objectId = function (_id) {
	return db._objectId(_id);
};

var save = function (dbname, table, data, cb) {
	db.exec(dbname, table, null, null, db.save, function (error, result) {
		if (error) {
			console.error("insert : " + table + "----Error: " + error.stack);
		}

		cb(result);
	}, data);
};

var update = function (dbname, table, query, options, data, cb) {
	db.exec(dbname, table, query, options, db.update, function (error, result) {
		if (error) {
			console.error("Update : " + table + "------Query: " + JSON.stringify(query) + "----Error: " + error.stack);
		}

		cb(result);
	}, data);
};

var select = function (dbname, table, query, options, cb) {
	db.exec(dbname, table, query, options, db.select, function (error, result) {
		if (error) {
			console.error("Select : " + table + "------Query: " + JSON.stringify(query) + "-----Error: " + error.stack);
		}

		cb(result);
	});
};

var selectSpecificFields = function (dbname, table, fields, query, options, cb) {
	db.exec(dbname, table, query, options, db.selectSpecificFields, function (error, result) {
		if (error) {
			console.error("Select : " + table + "------Query: " + JSON.stringify(query) + "-----Error: " + error.stack);
		}

		cb(result);
	}, fields);
};

var remove = function (dbname, table, query, options, cb) {
	db.exec(dbname, table, query, options, db.remove, function (error, result) {
		if (error) {
			console.error("Remove : " + table + "------Query: " + JSON.stringify(query) + "-----Error: " + error.stack);
		}

		cb(result);
	});
};

var join = function (dbname, table, query, cb) {
	db.exec(dbname, table, query, {}, db.join, function (error, result) {
		if (error) {
			console.error("Join : " + table + " ------Query[]: " + JSON.stringify(query) + "-----Error: " + error.stack);
		}

		cb(result);
	});
};

module.exports = {
	"init": init,
	"objectId": objectId,
	"save": save,
	"update": update,
	"select": select,
	"selectSpecificFields": selectSpecificFields,
	"remove": remove,
	"join": join
};
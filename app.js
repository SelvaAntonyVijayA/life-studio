global._ = require('underscore');
global.__util = require('./lib/util');
global.$async = require('async');

const express = require('express');
const plugins = require('./config/plugins');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
const fs = require('fs');
//var mongoose = require('mongoose');
//var db = require('./config/db-connect');
const app = express();
var context = require('./app-middlewares/context');
var logDirectory = path.join(__dirname, 'log');
 
//ILI App Middlewares
app.set('settings', require(path.join(process.cwd(), 'config', 'settings')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'src/assets')));
app.set('views', __dirname + '/public');
app.set('views', __dirname + '/public/views');
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(context);

var routes = require('./config/routes');
//db(mongoose, app);
plugins(path, __dirname, app);
routes(app);

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { error: err });
});

module.exports = app;


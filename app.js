global._ = require('underscore');

const express = require('express');
const plugins = require('./config/plugins');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
var mongoose = require('mongoose');
var db = require('./config/db-connect');
const app = express();


app.set('settings', require(path.join(process.cwd(), 'config', 'settings')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var routes = require('./config/routes');
db(mongoose, app);
plugins(path, __dirname, app);
routes(app);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


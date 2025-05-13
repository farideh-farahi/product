var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
//var authRouter = require('./routes/auth');
var categoryRouter = require('./routes/categoryRoutes');
var subCategoryRouter = require('./routes/subCategoryRoutes');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
//app.use('/api/v0/auth', authRouter);
app.use('/api/v0/cat', categoryRouter);
app.use('/api/v0/subcat', subCategoryRouter);

module.exports = app;

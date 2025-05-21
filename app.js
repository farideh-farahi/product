var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var authRoutes = require('./routes/authRouters');
var categoryRoutes = require('./routes/categoryRouters');
var subCategoryRoutes = require('./routes/subCategoryRouters');
var brandRoutes = require('./routes/brandRouters');
var imageRoutes = require('./routes/imageRouters');
var galleryRoutes = require('./routes/galleryRouters');
var productRoutes = require('./routes/productRouters');


var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/uploads", express.static("uploads"));

app.use('/api/v0/auth', authRoutes);
app.use('/api/v0/category', categoryRoutes);
app.use('/api/v0/subcategory', subCategoryRoutes);
app.use('/api/v0/brand', brandRoutes);
app.use('/api/v0/image', imageRoutes);
app.use('/api/v0/gallery', galleryRoutes);
app.use('/api/v0/product', productRoutes);

module.exports = app;

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import authRoutes from './routes/authRouters';
import categoryRoutes from './routes/categoryRouters';
import subCategoryRoutes from './routes/subCategoryRouters';
import brandRoutes from './routes/brandRouters';
import galleryRoutes from './routes/galleryRouters';
import coverRoutes from './routes/coverRouters';
import imageRoutes from './routes/imageRouters';
import productRoutes from './routes/productRouters';
import orderRoutes from './routes/orderRouters';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static assets
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/v0/auth', authRoutes);
app.use('/api/v0/category', categoryRoutes);
app.use('/api/v0/subcategory', subCategoryRoutes);
app.use('/api/v0/brand', brandRoutes);
app.use('/api/v0/gallery', galleryRoutes);
app.use('/api/v0/cover', coverRoutes);
app.use('/api/v0/image', imageRoutes);
app.use('/api/v0/product', productRoutes);
app.use('/api/v0/order', orderRoutes);

export default app;

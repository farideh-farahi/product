import { Request, Response, NextFunction } from 'express';
import cache from '../utils/cacheService';

const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const key = req.originalUrl;
  const cachedData = cache.get(key);

  if (cachedData) {
    console.log('🔥 Served from cache:', key);
    return res.json(cachedData);
  }

  const originalJson = res.json.bind(res);

  res.json = (body: any) => {
    try {
      const payload = JSON.parse(JSON.stringify(body)); // deep clone for safety
      cache.set(key, payload);
      console.log('📦 Cached new response:', key);
    } catch (err: any) {
      console.error('❌ Failed to cache response:', err.message);
    }
    return originalJson(body);
  };

  next();
};

export default cacheMiddleware;

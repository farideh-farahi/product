const cache = require("../utils/cacheService");

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  const cachedData = cache.get(key);

  if (cachedData) {
    console.log("🔥 Served from cache:", key);
    return res.json(cachedData);
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    try {
      const payload = JSON.parse(JSON.stringify(body)); // sanitize for caching
      cache.set(key, payload);
      console.log("📦 Cached new response:", key);
    } catch (err) {
      console.error("❌ Failed to cache response:", err.message);
    }
    res.sendResponse(body);
  };

  next();
};

module.exports = cacheMiddleware;

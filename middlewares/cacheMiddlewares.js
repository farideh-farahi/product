const client = require("../redisClient");

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl;
  client.get(key, (err, data) => {
    if (data) {
      return res.json(JSON.parse(data));
    }
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, 3600, JSON.stringify(body)); // Cache for 1 hour
      res.sendResponse(body);
    };
    next();
  });
};

module.exports = cacheMiddleware;

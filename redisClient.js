const redis = require("redis");
const client = redis.createClient();
client.on("connect", () => console.log("Redis is connected!"));

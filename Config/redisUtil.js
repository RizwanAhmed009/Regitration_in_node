require("dotenv").config();
const redis = require("redis");

const redisclient = redis.createClient();
redisclient.connect().catch((err) => {
  console.error("Failed to connect with redis client :", err.message);
});
redisclient.on("connect", () => {
  console.log(" Connected to redis from redisUtil...");
});
redisclient.on("error", (err) => {
  console.error(" Redis errors from redisUtil:", err);
});

module.exports = redisclient;

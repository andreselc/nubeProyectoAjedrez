const redis = require("redis");

const redisClient = redis.createClient();

const connectToRedis = () => {
    return new Promise((resolve, reject) => {
        redisClient.on("connect", () => {
            console.log("Connected to Redis...");
            resolve();
        });
        redisClient.on("error", (err) => {
            console.error("Error connecting to Redis:", err);
            reject(err);
        });
    });
};

module.exports = { connectToRedis, redisClient };
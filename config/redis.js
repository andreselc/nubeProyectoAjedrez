// redis.js
const redis = require('redis');

const redisClient = redis.createClient({
    socket: {
        port: 6379
    }
});

const connectToRedis = () => {
    return new Promise((resolve, reject) => {
        redisClient.connect().then(() => {
            console.log("Conectado a Redis...");
            resolve();
        }).catch((err) => {
            console.error("Error conectando a Redis:", err);
            reject(err);
        });
    });
};

module.exports = { connectToRedis, redisClient };
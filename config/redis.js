const redis = require('redis');

const redisClient = redis.createClient({
    socket: {
        port: 6379
    }
});

const connectToRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Conectado a Redis...");
    } catch (err) {
        console.error("Error conectando a Redis:", err);
    }
};

module.exports = { connectToRedis, redisClient };

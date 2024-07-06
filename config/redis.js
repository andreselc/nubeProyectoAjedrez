const redis = require('redis');
const dotenv = require("dotenv")

dotenv.config();

const host = process.env.REDIS_HOST || "localhost"


const redisClient = redis.createClient({
    port: 6379,
    host
});

redisClient.on("connect", () => {	
    console.log("Conectado a Redis...");
}
);

module.exports = redisClient;

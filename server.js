// server.js
require("dotenv").config();

const express = require("express");
const db = require("./config/db");
const { connectToRedis, redisClient } = require("./config/redis");

const main = async () => {
    const app = express();

    db.connect(err => {
        if (err) {
            console.error(err.message);
            process.exit(1);
        }

        console.log("Conectado a la base de datos Postgres...");
    });

    await connectToRedis();

    redisClient.on('error', (err) => {
        console.error("Error en cliente Redis:", err);
    });

    await redisClient.set('my_key', 'my_val');
    const value = await redisClient.get('my_key');
    await redisClient.del('my_key'); 

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
};

main();

require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const path = require("path");
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

    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.json());
    app.use(express.urlencoded({extended:true}))

    app.get("/", (req, res) => {
        res.render("index")
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
};

main();

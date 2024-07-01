require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const path = require("path");
const http = require("http")
const socketIO = require("socket.io")
const cookieParser = require("cookie-parser");
const { connectToRedis, redisClient } = require("./config/redis");

const main = async () => {
    const viewsRoutes = require("./routes/views");
    const userRoutes = require("./routes/api/user");
    const app = express();

    const server = http.createServer(app)

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

    app.use(cookieParser("secret"));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "public")));
    app.use(express.json());
    app.use(express.urlencoded({extended:true}))

    app.use("/",viewsRoutes);
    app.use("/api",userRoutes);

    const io = socketIO(server);
    io.on("connection", (socket) =>{
        socket.on("hello", (name) => {
            console.log("Hello " + name);

            socket.emit("hello", name);
        })
    })

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
};

main();

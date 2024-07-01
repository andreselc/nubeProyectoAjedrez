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

    const {newUser, removeUser} = require("./util/user")
    
    app.use("/",viewsRoutes);
    app.use("/api",userRoutes);

    const io = socketIO(server);

    io.on("connection", (socket) =>{
        socket.on('user-connected', (user, roomId=null) => {
            if(roomId){
                // TODO: ingresar con id a la sala
            }else{
                newUser(socket.id, user);
            }
        })

        socket.on('send-total-rooms-and-users', () => {
            redisClient.get('total-users', (err, reply) => {
                if(err) throw err;

                let totalUsers = 0;
                let totalRooms = 0;
                let numberOfRooms = [0, 0, 0, 0];

                if(reply){
                    totalUsers = parseInt(reply);
                }

                redisClient.get('total-rooms', (err, reply) => {
                    if(err) throw err;

                    if(reply){
                        totalUsers = parseInt(reply);
                    }

                    redisClient.get('number-of-rooms', (err, reply) => {
                        if(err) throw err;
        
                        if(reply){
                            numberOfRooms = JSON.parse(reply);
                        }
                        
                        socket.emit('receive-number-of-rooms-and-users', numberOfRooms, totalRooms, totalUsers);
                    })
                })

            })
        })

        socket.on("disconnect", () => {
            let socketId = socket.id;

            redisClient.get(socketId, (err, reply) => {
                if(err) throw err;

                if(reply){
                    let user = JSON.parse(reply);

                    if(user.room){
                        // TODO: Sacar al usuarios o usuario de la sala
                    }
                }
            })

            removeUser(socketId);
        })

    })

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
};

main();

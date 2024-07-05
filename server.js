require("dotenv").config();
const express = require("express");
const db = require("./config/db");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const { connectToRedis, redisClient } = require("./config/redis");
const { createTestingRooms } = require("./util/room");

const main = async () => {
    const viewsRoutes = require("./routes/views");
    const userRoutes = require("./routes/api/user");
    const app = express();

    const server = http.createServer(app);
    
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
    app.use(express.urlencoded({ extended: true }));

    const { newUser, removeUser } = require("./util/user");

    app.use("/", viewsRoutes);
    app.use("/api", userRoutes);

    const io = socketIO(server);

    io.on("connection", (socket) => {
        socket.on('user-connected', async (user, roomId=null) => {
            if (roomId) {
                // TODO: Ingresar a sala con el ID
            } else {
                await newUser(socket.id, user);
            }
        });

        socket.on('send-total-rooms-and-users', async () => {
            try {
                const totalUsersReply = await redisClient.get('total-users');
                let totalUsers = 0;
                let totalRooms = 0;
                let numberOfRooms = [0, 0, 0, 0];

                if (totalUsersReply) {
                    totalUsers = parseInt(totalUsersReply);
                }

                const totalRoomsReply = await redisClient.get('total-rooms');
                if (totalRoomsReply) {
                    totalRooms = parseInt(totalRoomsReply);
                }

                const numberOfRoomsReply = await redisClient.get('number-of-rooms');
                if (numberOfRoomsReply) {
                    numberOfRooms = JSON.parse(numberOfRoomsReply);
                }

                socket.emit('receive-total-rooms-and-users', numberOfRooms, totalRooms, totalUsers);
            } catch (err) {
                console.error("Error obteniendo datos de Redis:", err);
            }
        });

        socket.on("create-room", (roomId, time, user, password=null) => {
            redisClient.get(roomId, (err, reply) => {
                if(err) throw err;

                if(reply){
                    socket.emit("error", `La sala con el id '${roomId}' ya existe`)
                }else{
                    if(password){
                        createRoom(roomId, user, time, password)
                    }else{
                        createRoom(roomId, user, time)
                    }

                    socket.emit("room-created")
                }
            })
        })

        socket.on("join-room", (roomId, user, password=null) => {
            redisClient.get(roomId, (err, reply) => {
                if(err) throw err;

                if(reply){
                    let room = JSON.parse(reply);

                    if(room.players[1] === null){
                        if(room.password && (!password || room.password !== password)){
                            socket.emit("error", "Para ingresar a la sala necesitas colocar la contraseña correcta")

                            return
                        }

                        joinRoom(roomId, user);

                        if(room.password && password !== ""){
                            socket.emit("room-joined", roomId, password);
                        }else{
                            socket.emit("room-joined", roomId);
                        }
                    }else{
                        socket.emit("error", "La sala está llena")
                    }
                }else{
                    socket.emit("error", `La sala con id '${roomId}' no existe`)
                }
            })
        })

        socket.on('get-rooms', (rank) => {
            redisClient.get("rooms", (err, reply) => {
                if(err) throw err;

                if(reply){
                    let rooms = JSON.parse(reply);

                    if(rank === 'all'){
                        socket.emit("receive-rooms", rooms);
                    }else{
                        let filteredRooms = rooms.filter(room => room.players[0].user_rank === rank);

                        socket.emit("receive-rooms", filteredRooms);
                    }
                }else{
                    socket.emit("receive-rooms", [])
                }
            })
        })

        socket.on("send-message", (message, user, roomId=null) => {
            if (roomId) {
                socket.to(roomId).emit("receive-message", message, user);
            } else {
                socket.broadcast.emit("receive-message", message, user, true);
            }
        });

        socket.on("disconnect", async () => {
            let socketId = socket.id;

            try {
                const reply = await redisClient.get(socketId);
                if (reply) {
                    let user = JSON.parse(reply);

                    if (user.room) {
                        // TODO:
                    }
                }
                await removeUser(socketId);
            } catch (err) {
                console.error("Error al desconectar el usuario:", err);
            }
        });
    });

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Servidor ejecutándose en http://localhost:${PORT}`));
};

main();

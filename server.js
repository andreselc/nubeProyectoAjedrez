const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');
const path = require('path');
const http = require("http");
const socketIO = require("socket.io");
const cookieParser = require("cookie-parser");
const redisClient = require('./config/redis');
const viewsRoutes = require("./routes/views");
const userRoutes = require("./routes/api/user");
const { removeRoom } = require("./util/room");
const { createRoom, joinRoom } = require("./util/room");
const { newUser, removeUser } = require("./util/user");

dotenv.config();

const app = express();
const server = http.createServer(app);

db.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err.stack);
        process.exit(1);
    }
    console.log('Conectado a la base de datos Postgres');
});

redisClient.on('error', (err) => {
    console.error("Error en cliente Redis:", err);
});

redisClient.set('my_key', 'my_val');
redisClient.get('my_key', (err, value) => {
    if (err) {
        console.error("Error obteniendo valor de Redis:", err);
    }
    console.log("Valor de my_key:", value);
});
redisClient.del('my_key');

app.use(cookieParser("secret"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", viewsRoutes);
app.use("/api", userRoutes);

const io = socketIO(server);

io.on("connection", (socket) => {
    socket.on('user-connected', (user, roomId = null) => {
        if (roomId) {
            redisClient.get(roomId, (err, reply) => {
                if (err) throw err;

                if (reply) {
                    let room = JSON.parse(reply);

                    if (room.gameStarted) {
                        socket.emit("error", "The room is full")
                        return;

                    }

                    if (room.password && (!password || room.password !== password)) {
                        socket.emit("error", "You need to enter the correct password to join the room")
                        return;
                    }
                    
                    socket.join(roomId);
                    newUser(socket.id, user, roomId);

                    if(room.players[0].username === user.username){
                        return;
                    }  
                    
                    if(room.players[1] === null){
                        room.players[1] = user;    
                    }

                    room.gameStarted = true;
                    redisClient.set(roomId, JSON.stringify(room));
                    socket.to(roomId).emit("game-started")

                    
                    redisClient.get("roomIndices", (err, reply) => {
                        
                        if (err) throw err;

                        if (reply){
                            let roomIndices = JSON.parse(reply);
                            redisClient.get("rooms", (err, reply) => {
                                if (reply){
                                    let rooms = JSON.parse(reply);

                                    rooms[roomIndices[roomId]] = room;
                                    redisClient.set("rooms", JSON.stringify(rooms))
                                }
                            })
                        }
                    })
                
                }
        }
    )
        } else {
            newUser(socket.id, user);
        }
    });

    socket.on("get-game-details", (roomId, user) => {
        redisClient.get(roomId, (err, reply) => {
            if (err) throw err;

            if(reply){
                let room = JSON.parse(reply);
                let details = {players: room.players, time: room.time}
                socket.emit("receive-game-details", details)
            }
        })
    })

    socket.on('send-total-rooms-and-users', () => {
        try {
            redisClient.get('total-users', (err, totalUsersReply) => {
                if (err) throw err;
                let totalUsers = 0;
                let totalRooms = 0;
                let numberOfRooms = [0, 0, 0, 0];

                if (totalUsersReply) {
                    totalUsers = parseInt(totalUsersReply);
                }

                redisClient.get('total-rooms', (err, totalRoomsReply) => {
                    if (err) throw err;
                    if (totalRoomsReply) {
                        totalRooms = parseInt(totalRoomsReply);
                    }

                    redisClient.get('number-of-rooms', (err, numberOfRoomsReply) => {
                        if (err) throw err;
                        if (numberOfRoomsReply) {
                            numberOfRooms = JSON.parse(numberOfRoomsReply);
                        }

                        socket.emit('receive-total-rooms-and-users', numberOfRooms, totalRooms, totalUsers);
                    });
                });
            });
        } catch (err) {
            console.error("Error obteniendo datos de Redis:", err);
        }
    });

    socket.on("create-room", (roomId, time, user, password = null) => {
        redisClient.get(roomId, (err, reply) => {
            if (err) throw err;

            if (reply) {
                socket.emit("error", `La sala con el id '${roomId}' ya existe`);
            } else {
                if (password) {
                    createRoom(roomId, user, time, password);
                } else {
                    createRoom(roomId, user, time);
                }

                socket.emit("room-created");
            }
        });
    });

    socket.on("join-room", (roomId, user, password = null) => {
        redisClient.get(roomId, (err, reply) => {
            if (err) throw err;

            if (reply) {
                let room = JSON.parse(reply);

                if (room.players[1] === null) {
                    if (room.password && (!password || room.password !== password)) {
                        socket.emit("error", "Para ingresar a la sala necesitas colocar la contraseña correcta");
                        return;
                    }

                    joinRoom(roomId, user);

                    if (room.password && password !== "") {
                        socket.emit("room-joined", roomId, password);
                    } else {
                        socket.emit("room-joined", roomId);
                    }
                } else {
                    socket.emit("error", "La sala está llena");
                }
            } else {
                socket.emit("error", `La sala con id '${roomId}' no existe`);
            }
        });
    });

    socket.on("join-random", (user) => {
        redisClient.get("rooms", (err, reply) => {
            if (err) throw err;

            if (reply) {
                let rooms = JSON.parse(reply);
                let room = rooms.find(room => room.players[1] === null && !room.password);

                if (room) {
                    joinRoom(room.id, user);
                    socket.emit("room-joined", room.id);
                } else {
                    socket.emit("error", "No se encontró la sala");
                }
            } else {
                socket.emit("error", "No se encontró la sala");
            }
        });
    });

    socket.on('get-rooms', (rank) => {
        redisClient.get("rooms", (err, reply) => {
            if (err) throw err;

            if (reply) {
                let rooms = JSON.parse(reply);

                if (rank === 'all') {
                    socket.emit("receive-rooms", rooms);
                } else {
                    let filteredRooms = rooms.filter(room => room.players[0].user_rank === rank);
                    socket.emit("receive-rooms", filteredRooms);
                }
            } else {
                socket.emit("receive-rooms", []);
            }
        });
    });

    socket.on("send-message", (message, user, roomId = null) => {
        if (roomId) {
            socket.to(roomId).emit("receive-message", message, user);
        } else {
            socket.broadcast.emit("receive-message", message, user, true);
        }
    });

    socket.on("disconnect", () => {
        let socketId = socket.id;

        redisClient.get(socketId, (err, reply) => {
            if (err) throw err;

            if (reply) {
                let user = JSON.parse(reply);

                if (user.room) {
                    // Logica para manejar cuando un usuario desconectado está en una sala
                }
            }
        });

        removeUser(socketId);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`El servidor está corriendo en http://localhost:${PORT}`));
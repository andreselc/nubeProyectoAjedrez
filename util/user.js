const redisClient = require("../config/redis");

const newUser = (socketId, user, roomId) => {
    if (roomId) {
        user.room = roomId;
    }

    redisClient.set(socketId, JSON.stringify(user));

    redisClient.get('total-users', (err, reply) => {
        if (err) {
            throw err;
        }

        if (reply) {
            let totalUsers = parseInt(reply);
            totalUsers += 1;
            redisClient.set('total-users', totalUsers + "");
        } else {
            redisClient.set('total-users', '1');
        }
    });
}

const removeUser = (socketId) => {
    redisClient.del(socketId);
    redisClient.get('total-users', (err, reply) => {
        if (err) throw err;

        if (reply) {
            let totalUsers = parseInt(reply);
            totalUsers -= 1;

            if (totalUsers === 0) {
                redisClient.del("total-users");
            } else {
                redisClient.set("total-users", totalUsers + "");
            }
        }
    });
}

module.exports = { newUser, removeUser };

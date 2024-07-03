const redisClient = require("../config/redis")

// FIXME:

// user object -> {socket_id: {'username': 'testuser', 'user_rank': 'beginner', 'user_points': 1000, 'room': null}}
const newUser = async (socketId, user, roomId) => {
    if (roomId) {
        user.room = roomId;
    }

    await redisClient.set(socketId, JSON.stringify(user));

    const totalUsersReply = await redisClient.get('total-users');
    if (totalUsersReply) {
        let totalUsers = parseInt(totalUsersReply);

        totalUsers += 1;
        await redisClient.set('total-users', totalUsers.toString());
    } else {
        await redisClient.set('total-users', '1');
    }
}

const removeUser = async (socketId) => {

    await redisClient.del(socketId);
    const totalUsersReply = await redisClient.get('total-users');

    if (totalUsersReply) {
        let totalUsers = parseInt(totalUsersReply);

        totalUsers -= 1;

        if (totalUsers === 0) {
            await redisClient.del('total-users');
        } else {
            await redisClient.set('total-users', totalUsers.toString());
        }
    }
}

module.exports = {newUser, removeUser}
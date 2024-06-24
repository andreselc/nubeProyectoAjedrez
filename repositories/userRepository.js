const { User, UserInfo } = require('../models');
const { Op } = require('sequelize');

class UserRepository {
  async findByUsernameOrEmail(username, email) {
    return User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: email }
        ]
      }
    });
  }


  async findByEmail(email) {
    return User.findOne({
      where: {
           email: email 
      }
    });
  }


  async findUserInfoByUserId(userId) {
    return UserInfo.findOne({
      where: {
        user_id: userId
      }
    });
  }

  async createUser(userData) {
    const user = await User.create(userData);
    await UserInfo.create({
      user_id: user.id,
      user_rank: 'beginner',
      user_points: 1000
    });
    return user;
  }
}

module.exports = new UserRepository();

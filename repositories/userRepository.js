const { User } = require('../models');
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

  async createUser(userData) {
    return User.create(userData);
  }
}

module.exports = new UserRepository();
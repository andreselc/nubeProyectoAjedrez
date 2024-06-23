'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserInfo extends Model {
    static associate(models) {
      UserInfo.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE'
      });
    }
  }
  UserInfo.init({
    user_rank: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'beginner'
    },
    user_points: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    }
  }, {
    sequelize,
    modelName: 'UserInfo',
    tableName: 'user_info',
  });
  return UserInfo;
};
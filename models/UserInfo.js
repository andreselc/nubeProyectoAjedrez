// models/userInfo.js
module.exports = (sequelize, DataTypes) => {
  const UserInfo = sequelize.define('UserInfo', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      },
      onDelete: 'CASCADE',
      primaryKey: true
    },
    user_rank: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      defaultValue: 'beginner'
    },
    user_points: {
      type: DataTypes.INTEGER,
      defaultValue: 1000
    }
  }, {
    tableName: 'user_info'
  });

  UserInfo.associate = function(models) {
    UserInfo.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
  };

  return UserInfo;
};

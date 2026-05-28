module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Like", {
    utilizador_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    tweet_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: "likes",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });
};

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Follow", {
    seguidor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    seguido_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    }
  }, {
    tableName: "seguidores",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });
};

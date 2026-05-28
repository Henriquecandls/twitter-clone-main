module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Comment", {
    conteudo: {
      type: DataTypes.STRING(280),
      allowNull: false
    }
  }, {
    tableName: "comentarios",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });
};
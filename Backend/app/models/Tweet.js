module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Tweet", {
    conteudo: {
      type: DataTypes.STRING(280),
      allowNull: false
    },
    imagem_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: "tweets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false
  });
};
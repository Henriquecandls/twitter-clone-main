const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const UserModel = require("./models/Users");
const TweetModel = require("./models/Tweet");
const FollowModel = require("./models/Follow");
const LikeModel = require("./models/Like");
const CommentModel = require("./models/Comment");

const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.DB_SCHEMA,
  process.env.DB_USER,
  process.env.DB_PASSWORD || process.env.DB_PASS,
  {
    dialect: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const User = UserModel(sequelize, DataTypes);
const Tweet = TweetModel(sequelize, DataTypes);
const Comment = CommentModel(sequelize, DataTypes);
const Like = LikeModel(sequelize, DataTypes);
const Follow = FollowModel(sequelize, DataTypes);

User.hasMany(Tweet, { foreignKey: "utilizador_id", as: "tweets", onDelete: "CASCADE", onUpdate: "CASCADE" });
Tweet.belongsTo(User, { foreignKey: "utilizador_id", as: "autor" });

User.hasMany(Comment, { foreignKey: "utilizador_id", as: "comments", onDelete: "CASCADE", onUpdate: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "utilizador_id", as: "autor" });

Tweet.hasMany(Comment, { foreignKey: "tweet_id", as: "comments", onDelete: "CASCADE", onUpdate: "CASCADE" });
Comment.belongsTo(Tweet, { foreignKey: "tweet_id", as: "tweet" });

User.hasMany(Like, { foreignKey: "utilizador_id", as: "likes", onDelete: "CASCADE", onUpdate: "CASCADE" });
Like.belongsTo(User, { foreignKey: "utilizador_id", as: "utilizador" });

Tweet.hasMany(Like, { foreignKey: "tweet_id", as: "likes", onDelete: "CASCADE", onUpdate: "CASCADE" });
Like.belongsTo(Tweet, { foreignKey: "tweet_id", as: "tweet" });

User.belongsToMany(User, {
  through: Follow,
  as: "following",
  foreignKey: "seguidor_id",
  otherKey: "seguido_id",
});
User.belongsToMany(User, {
  through: Follow,
  as: "followers",
  foreignKey: "seguido_id",
  otherKey: "seguidor_id",
});

async function initDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established.");
  } catch (err) {
    console.error("DB connection/sync failed:", err && err.message ? err.message : err);
  }
}

initDatabase();

module.exports = {
  sequelize,
  User,
  Tweet,
  Comment,
  Like,
  Follow,
};
const { Tweet, User, Comment, Like } = require("../sequelize");
const { Op } = require("sequelize");

const tweetIncludes = [
  { model: User, as: "autor", attributes: ["id", "username"] },
  {
    model: Comment,
    as: "comments",
    include: [{ model: User, as: "autor", attributes: ["id", "username"] }]
  },
  {
    model: Like,
    as: "likes",
    attributes: ["utilizador_id", "tweet_id", "created_at"]
  }
];

async function listTweets(where = {}) {
  return Tweet.findAll({
    where,
    order: [["created_at", "DESC"]],
    include: tweetIncludes
  });
}

const tweetController = {
  getFeed: async (req, res) => {
    try {
      const seguidorId = req.user?.id;
      if (!seguidorId) return res.status(401).json({ message: "Token em falta." });

      const followRows = await require("../sequelize").Follow.findAll({
        where: { seguidor_id: seguidorId },
        attributes: ["seguido_id"]
      });

      const followedIds = followRows.map((r) => r.seguido_id);
      const allowedAuthorIds = Array.from(new Set([...followedIds, seguidorId]));

      const tweets = await listTweets({ utilizador_id: { [Op.in]: allowedAuthorIds } });
      res.json(tweets);
    } catch (error) {
      console.error("Feed error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getPublicFeed: async (req, res) => {
    try {
      if (!req.user?.id) return res.status(401).json({ message: "Token em falta." });

      const tweets = await listTweets();
      res.json(tweets);
    } catch (error) {
      console.error("Public feed error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  createTweet: async (req, res) => {
    try {
      const { conteudo } = req.body;
      if (!conteudo || conteudo.length > 280) {
        return res.status(400).json({ message: "conteudo é obrigatório e deve ter até 280 caracteres." });
      }

      const imagem_url = req.file ? `/uploads/${req.file.filename}` : req.body.imagem_url || null;

      const tweet = await Tweet.create({
        conteudo,
        imagem_url,
        utilizador_id: req.user.id
      });

      res.status(201).json(tweet);
    } catch (error) {
      console.error("Create tweet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  listAllTweets: async (req, res) => {
    try {
      const currentUser = await User.findByPk(req.user.id);
      if (!currentUser || !currentUser.is_admin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const tweets = await Tweet.findAll({
        order: [["created_at", "DESC"]],
        include: tweetIncludes
      });

      res.json(tweets);
    } catch (error) {
      console.error("List all tweets error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  updateTweet: async (req, res) => {
    try {
      const tweetId = Number(req.params.id);
      const { conteudo, imagem_url } = req.body;

      const tweet = await Tweet.findByPk(tweetId);
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }

      if (tweet.utilizador_id !== req.user.id) {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser || !currentUser.is_admin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      await tweet.update({
        ...(conteudo !== undefined ? { conteudo } : {}),
        ...(imagem_url !== undefined ? { imagem_url } : {})
      });

      res.json({ message: "Tweet updated", tweet });
    } catch (error) {
      console.error("Update tweet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  deleteTweet: async (req, res) => {
    try {
      const tweetId = Number(req.params.id);

      const tweet = await Tweet.findByPk(tweetId);
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }

      if (tweet.utilizador_id !== req.user.id) {
        const currentUser = await User.findByPk(req.user.id);
        if (!currentUser || !currentUser.is_admin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }

      await tweet.destroy();
      res.json({ message: "Tweet deleted" });
    } catch (error) {
      console.error("Delete tweet error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  likeTweet: async (req, res) => {
    try {
      const tweetId = Number(req.params.id);

      const tweet = await Tweet.findByPk(tweetId);
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }

      const existing = await Like.findOne({
        where: { utilizador_id: req.user.id, tweet_id: tweetId }
      });

      if (existing) {
        return res.status(400).json({ message: "Already liked" });
      }

      await Like.create({ utilizador_id: req.user.id, tweet_id: tweetId });
      res.json({ message: "Tweet liked" });
    } catch (error) {
      console.error("Like tweet error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  unlikeTweet: async (req, res) => {
    try {
      const tweetId = Number(req.params.id);

      const destroyed = await Like.destroy({
        where: { utilizador_id: req.user.id, tweet_id: tweetId }
      });

      if (!destroyed) {
        return res.status(404).json({ message: "Like not found" });
      }

      res.json({ message: "Like removed" });
    } catch (error) {
      console.error("Unlike tweet error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  addComment: async (req, res) => {
    try {
      const tweetId = Number(req.params.id);
      const { conteudo } = req.body;

      if (!conteudo || conteudo.length > 280) {
        return res.status(400).json({ message: "Comentário inválido." });
      }

      const tweet = await Tweet.findByPk(tweetId);
      if (!tweet) {
        return res.status(404).json({ message: "Tweet not found" });
      }

      const comment = await Comment.create({
        tweet_id: tweetId,
        utilizador_id: req.user.id,
        conteudo
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({ message: error.message });
    }
  },

  getTweetById: async (req, res) => {
    try {
      const tweet = await Tweet.findByPk(Number(req.params.id), {
        include: tweetIncludes
      });

      if (!tweet) {
        return res.status(404).json({ message: "Tweet não encontrado." });
      }

      return res.json(tweet);
    } catch (error) {
      console.error("Get tweet error:", error);
      return res.status(500).json({ message: error.message });
    }
  },

  listComments: async (req, res) => {
    try {
      const comments = await Comment.findAll({
        where: { tweet_id: Number(req.params.id) },
        include: [{ model: User, as: "autor", attributes: ["id", "username"] }],
        order: [["created_at", "DESC"]]
      });

      return res.json(comments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updateComment: async (req, res) => {
    try {
      const comment = await Comment.findByPk(Number(req.params.id));

      if (!comment) {
        return res.status(404).json({ message: "Comentário não encontrado." });
      }

      const user = await User.findByPk(req.user.id);

      if (comment.utilizador_id !== req.user.id && !user?.is_admin) {
        return res.status(403).json({ message: "Sem permissões." });
      }

      if (!req.body.conteudo || req.body.conteudo.length > 280) {
        return res.status(400).json({ message: "Comentário inválido." });
      }

      await comment.update({ conteudo: req.body.conteudo });
      return res.json(comment);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findByPk(Number(req.params.id));

      if (!comment) {
        return res.status(404).json({ message: "Comentário não encontrado." });
      }

      const user = await User.findByPk(req.user.id);

      if (comment.utilizador_id !== req.user.id && !user?.is_admin) {
        return res.status(403).json({ message: "Sem permissões." });
      }

      await comment.destroy();
      return res.json({ message: "Comentário removido." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = tweetController;

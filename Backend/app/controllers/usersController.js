const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User, Follow } = require("../sequelize");

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    },
    process.env.JWT_SECRET || process.env.TOKEN_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "6h" }
  );
}

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email e password são obrigatórios." });
    }

    const existing = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existing) return res.status(409).json({ message: "Username ou email já existe." });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: passwordHash });
    const token = generateAccessToken(user);

    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin } });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "username e password são obrigatórios." });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const validPassword =
      user.password === password || (await bcrypt.compare(password, user.password));
    if (!validPassword) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const token = generateAccessToken(user);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.logout = async (req, res) => {
  try {
    res.json({ message: "Logout efetuado com sucesso." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.profile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'is_admin', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ message: "Utilizador não encontrado." });
    }

    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};


exports.discoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId }
      },
      attributes: ["id", "username", "email", "is_admin", "created_at"]
    });

    const following = await Follow.findAll({
      where: { seguidor_id: currentUserId },
      attributes: ["seguido_id"]
    });

    const followingIds = new Set(following.map((item) => item.seguido_id));

    res.json(
      users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
        is_following: followingIds.has(user.id)
      }))
    );
  } catch (err) {
    console.error("Discover users error:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.follow = async (req, res) => {
  try {
    const seguidor_id = req.user.id;
    const seguido_id = Number(req.params.id);

    if (!seguido_id || seguidor_id === seguido_id) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const targetUser = await User.findByPk(seguido_id);
    if (!targetUser) {
      return res.status(404).json({ message: "Utilizador a seguir não encontrado." });
    }

    const existing = await Follow.findOne({ where: { seguidor_id, seguido_id } });
    if (existing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    await Follow.create({ seguidor_id, seguido_id });
    res.json({ message: 'Now following user' });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const seguidor_id = req.user.id;
    const seguido_id = Number(req.params.id);

    const destroyed = await Follow.destroy({ where: { seguidor_id, seguido_id } });
    if (!destroyed) {
      return res.status(404).json({ message: 'Follow relationship not found' });
    }

    res.json({ message: 'Unfollowed user' });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

const isAdmin = (user) => user && user.is_admin;

exports.listUsers = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'is_admin', 'created_at']
    });

    res.json(users);
  } catch (err) {
    console.error("List users error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'is_admin', 'created_at']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!isAdmin(req.user) && Number(req.params.id) !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { username, email, password, is_admin } = req.body;
    const updateData = {
      ...(username !== undefined ? { username } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(is_admin !== undefined ? { is_admin } : {}),
    };
    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await user.update({
      ...updateData
    });

    res.json({ message: 'User updated', user: { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin } });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!isAdmin(req.user)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Erro interno." });
  }
};

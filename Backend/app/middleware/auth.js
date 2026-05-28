const jwt = require("jsonwebtoken");

function authenticateTokenFromHeaders(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Token em falta." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(403).json({ message: "Token inválido." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user?.is_admin) {
    return res.status(403).json({ message: "Acesso reservado a administrador." });
  }
  return next();
}

module.exports = {
  authenticateTokenFromHeaders,
  requireAdmin,
};

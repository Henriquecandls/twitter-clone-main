const express = require("express");
const usersController = require("../controllers/usersController");
const { authenticateTokenFromHeaders } = require("../middleware/auth");

const router = express.Router();

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);
router.post("/logout", authenticateTokenFromHeaders, usersController.logout);
router.get("/profile", authenticateTokenFromHeaders, usersController.profile);

module.exports = router;

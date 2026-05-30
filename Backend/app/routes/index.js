var express = require('express');
var router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || 'https://henriquecandls.github.io/twitter-clone-main/';

/* Redireciona para a landing page (frontend no GitHub Pages). */
router.get('/', function (req, res) {
  res.redirect(302, FRONTEND_URL);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const tweetController = require('../controllers/tweetController');
const { authenticateTokenFromHeaders } = require('../middleware/auth');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

router.use(authenticateTokenFromHeaders);

router.get('/feed', tweetController.getFeed);
router.get('/', tweetController.listAllTweets);
router.get('/:id', tweetController.getTweetById);
router.post('/', upload.single('image'), tweetController.createTweet);
router.put('/:id', tweetController.updateTweet);
router.delete('/:id', tweetController.deleteTweet);
router.post('/:id/like', tweetController.likeTweet);
router.delete('/:id/like', tweetController.unlikeTweet);
router.post('/:id/comments', tweetController.addComment);
router.get('/:id/comments', tweetController.listComments);
router.put('/comments/:id', tweetController.updateComment);
router.delete('/comments/:id', tweetController.deleteComment);

module.exports = router;
const router = require('express').Router();

const authRoutes = require('./auth.route');
const commentRoutes = require('./comment.route');
const postRoutes = require('./post.route');
const reactionRoutes = require('./reaction.route');

router.use('/auth', authRoutes);
router.use('/comments', commentRoutes);
router.use('/posts', postRoutes);
router.use('/reactions', reactionRoutes);
module.exports = router;

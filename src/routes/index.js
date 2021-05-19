const router = require('express').Router();

const authRoutes = require('./auth.route');
const commentRoutes = require('./comment.route')
const postRoutes = require('./post.route');

router.use('/auth', authRoutes);
router.use('/comments', commentRoutes)
router.use('/posts', postRoutes)
module.exports = router;

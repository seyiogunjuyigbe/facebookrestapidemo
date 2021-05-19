const router = require('express').Router();

const authRoutes = require('./auth.route');
const postRoutes = require('./post.route');

router.use('/auth', authRoutes);
router.use('/posts', postRoutes)
module.exports = router;

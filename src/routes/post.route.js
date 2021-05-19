const router = require('express').Router()
const { authenticate, upload, checkUserPrivilege } = require('../middlewares');
const PostController = require('../controllers/post.controller');

router.post('/', authenticate, upload.array('media', 10), PostController.createPost);
router.get('/', PostController.fetchPosts)
router.get('/:postId', PostController.fetchSinglePost)
router.put('/:postId', authenticate, checkUserPrivilege("Post"), upload.array('media', 10), PostController.updatePost);
router.delete('/:postId', authenticate, checkUserPrivilege("Post"), PostController.updatePost);

module.exports = router;

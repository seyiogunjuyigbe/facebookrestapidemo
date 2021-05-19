const router = require('express').Router()
const { check } = require('express-validator');
const { authenticate, upload, checkUserPrivilege, validate } = require('../middlewares');
const CommentController = require('../controllers/comment.controller');

router.post('/', authenticate, [
    check('text').notEmpty().withMessage('comment text is required'),
    check('postId').isMongoId().withMessage('post ID required in correct format')
], validate,
    CommentController.createComment);

router.get('/', CommentController.fetchComments)
router.get('/:commentId', CommentController.fetchSingleComment)
router.put('/:commentId', authenticate, checkUserPrivilege("Comment"),
    [
        check('text').notEmpty().withMessage('comment text is required'),
    ], validate,
    CommentController.updateComment);
router.delete('/:commentId', authenticate, checkUserPrivilege("Comment"), CommentController.deleteComment);

module.exports = router;

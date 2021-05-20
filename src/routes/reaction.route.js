const router = require('express').Router();
const { check } = require('express-validator');
const {
  authenticate,
  checkUserPrivilege,
  validate,
} = require('../middlewares');
const ReactionController = require('../controllers/reaction.controller');

router.post(
  '/',
  authenticate,
  [
    check('type')
      .isIn(['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'])
      .withMessage(
        `reaction type is expected to be one of: ${[
          'like',
          'love',
          'care',
          'haha',
          'wow',
          'sad',
          'angry',
        ].join(',')}`
      ),
    check('referenceType')
      .isIn(['Post', 'Comment'])
      .withMessage('reference type can either be "Post" or "Comment"'),
    check('referenceId')
      .isMongoId()
      .withMessage('reference ID required in correct format'),
  ],
  validate,
  ReactionController.createReaction
);

router.get('/', ReactionController.fetchReactions);
router.get('/:reactionId', ReactionController.fetchSingleReaction);
router.put(
  '/:reactionId',
  authenticate,
  checkUserPrivilege('Reaction'),
  [
    check('type')
      .isIn(['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'])
      .withMessage(
        `reaction type is expected to be one of: ${[
          'like',
          'love',
          'care',
          'haha',
          'wow',
          'sad',
          'angry',
        ].join(',')}`
      ),
  ],
  validate,
  ReactionController.updateReaction
);
router.delete(
  '/:reactionId',
  authenticate,
  checkUserPrivilege('Reaction'),
  ReactionController.deleteReaction
);

module.exports = router;

const express = require('express');
const { check } = require('express-validator');
const User = require('../controllers/userCtrl');
const {
  authenticate,
  isAdmin,
  authenticateAndAllowPass,
} = require('../middlewares/authentication');
const validate = require('../middlewares/validate');
const { parser } = require('../middlewares/multer');

const router = express.Router();

router.get('/', authenticateAndAllowPass, User.fetchAllUsers);
router.post(
  '/',
  authenticate,
  isAdmin(['admin']),
  [
    check('firstName').notEmpty().withMessage('required field'),
    check('lastName').notEmpty().withMessage('required field'),
    check('email').isEmail().withMessage('invalid email format'),
    check('role')
      .isIn(['admin', 'consultant', 'manager'])
      .withMessage(
        `required field: ${['admin', 'consultant', 'manager'].join(' , ')}`
      ),
  ],
  validate,
  User.createNewUser
);

router.get('/profile', authenticateAndAllowPass, User.fetchProfile);
router.put(
  '/profile',
  authenticateAndAllowPass,
  parser.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'callToBarCertificate',
      maxCount: 1,
    },
    {
      name: 'proofOfPayment',
      maxCount: 1,
    },
    {
      name: 'otherCertificates',
      maxCount: 10,
    },
  ]),
  User.updateProfile
);

router.get('/:userId', User.fetchUser);

router.put(
  '/:userId/status',
  authenticate,
  [
    check('status')
      .isIn(['active', 'suspended'])
      .withMessage(`required field: ${['active', 'suspended'].join(' , ')}`),
  ],
  validate,
  User.updateUserStatus
);
router.delete('/:userId', authenticate, isAdmin(['admin']), User.deleteUser);
router.post(
  '/rate-lawyer',
  authenticate,
  [
    check('lawyerId').isMongoId().withMessage('required field'),
    check('value').notEmpty().withMessage('required field'),
  ],
  validate,
  User.rateUser
);
module.exports = router;

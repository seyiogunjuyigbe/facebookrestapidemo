const express = require('express');
const { check } = require('express-validator');
const Auth = require('../controllers/auth.controller');
const { authenticate, validate } = require('../middlewares');

const router = express.Router();
router.post(
  '/register',
  [
    check('firstName').notEmpty().withMessage('firstName is required'),
    check('lastName').notEmpty().withMessage('lastName is required'),
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  Auth.register
);
router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Enter a valid email address'),
    check('password').not().isEmpty().withMessage('Password is required'),
  ],
  validate,
  Auth.login
);
router.get('/verify-email/:token', Auth.verify);
router.get('/verify-token/resend', Auth.resendToken);
router.get('/password/recover', Auth.recover);
router.post(
  '/password/reset/:token',
  [
    check('password')
      .not()
      .isEmpty()
      .isLength({ min: 6 })
      .withMessage('Must be at least 8 chars long'),
    check('confirmPassword', 'Passwords do not match').custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  validate,
  Auth.resetPassword
);
router.post(
  '/password/change',
  authenticate,
  [
    check('oldPassword')
      .not()
      .isEmpty()
      .withMessage('Your current password is required'),
    check('password')
      .not()
      .isEmpty()
      .isLength({ min: 8 })
      .withMessage('Must be at least 8 chars long'),
    check('confirmPassword', 'Passwords do not match').custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  validate,
  Auth.changePassword
);
module.exports = router;

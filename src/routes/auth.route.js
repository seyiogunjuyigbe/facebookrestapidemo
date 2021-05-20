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
router.get('/request-verification', Auth.resendToken);
router.get('/recover-password', Auth.recover);
router.post(
  '/reset-password/:token',
  [
    check('password')
      .not()
      .isEmpty()
      .isLength({ min: 5 })
      .withMessage('Must be at least 5 chars long'),
  ],
  validate,
  Auth.resetPassword
);
router.post(
  '/change-password',
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

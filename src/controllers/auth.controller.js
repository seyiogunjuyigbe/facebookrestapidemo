const moment = require('moment');
const crypto = require('crypto');

const { User, Token } = require('../models')

const { response } = require('../middlewares');
const { sendMail } = require('../services/message');

const { generateToken } = require('../services/jwtService');

const { SITE_URL } = process.env;
module.exports = {
  async register(req, res, next) {
    const { email } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return response(res, 409, 'An account with this email already exists');
      }
      const newUser = await User.create({
        ...req.body,
      });

      const emailToken = await Token.create({
        token: crypto.randomBytes(20).toString('hex'),
        user: newUser._id,
        type: 'verify-email',
        expiresIn: moment.utc().add(1, 'day'),
      });
      const token = generateToken({
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      });
      let link = `${SITE_URL}/verify/${emailToken.token}`;
      const subject = 'Welcome!';
      const mail = newUser.email;
      const body = `
      Hi <b>${newUser.firstName} ${newUser.lastName}</b>,
                                    <br />
                                    <br />
                                    We may need to send you critical information
                                    about our service and it is important that
                                    we have an accurate email address.
                                    <br /><br />

                                    <p>
                                      Click on the button below to confirm your
                                      email address.
                                    </p>
      `;
      await sendMail(subject, mail, body, null, link, 'Verify your Account');
      return response(res, 200, 'user registered successfully', {
        newUser,
        token,
      });
    } catch (error) {
      return next(error);
    }
  },
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return response(res, 401, 'Invalid email or password');
      }
      // validate password
      if (!user.comparePassword(password)) {
        return response(res, 401, 'Invalid email or password');
      }
      // Login responseful, write token, and send back user
      let { firstName, lastName, id, role } = user;
      let token = generateToken({
        id,
        firstName,
        lastName,
        email,
        role,
      });
      return response(res, 200, 'login successful', { token, user });
    } catch (err) {
      next(err);
    }
  },

  async verify(req, res, next) {
    if (!req.params.token)
      return response(
        res,
        400,
        'We were unable to find a user for this token.'
      );
    try {
      const token = await Token.findOne({
        token: req.params.token,
        type: 'verify-email',
      }).populate('user');
      if (!token)
        return response(
          res,
          400,
          'Your verification link may have expired. Please request a new one'
        );
      if (
        token.expired ||
        moment.utc(token.expiresIn).diff(moment.utc(), 'minutes') < 0
      ) {
        // expire token
        token.expired = true;
        await token.save();
        return response(
          res,
          403,
          'Verification link expired. Please request a new onw'
        );
      }
      // If we found a token, find a matching user
      let { user } = token;
      if (!user)
        return response(
          res,
          400,
          'We were unable to find a user for this link.'
        );
      if (user.isVerified)
        return response(res, 400, 'This user has already been verified.');
      // Verify and save the user
      user.isVerified = true;
      await user.save();
      token.expired = true;
      await token.save();
      return response(res, 200, 'Account verified successfully.');
    } catch (err) {
      next(err);
    }
  },
  async resendToken(req, res, next) {
    try {
      const { email } = req.query;
      if (!email) return response(res, 400, 'Email required');
      const user = await User.findOne({ email });
      if (!user)
        return response(
          res,
          401,
          `The email address ${email} is not associated with any account. Double-check your email address and try again.`
        );
      if (user.isVerified)
        return response(
          res,
          400,
          'This account has already been verified. Please log in.'
        );
      await Token.updateMany({
        user: user._id,
        type: 'verify-email',
        expired: false,
      });
      const token = await Token.create({
        token: crypto.randomBytes(20).toString('hex'),
        expiresIn: moment.utc().add(1, 'hours'),
        user,
        type: 'verify-email',
      });
      let link = `${SITE_URL}/verify/${token.token}`;
      let subject = 'Account Verification';
      let message = `
                    Please click on the following link ${link} to verify your account. \n`;
      console.log({ link });
      await sendMail(subject, user.email, message, null, link, 'Verify Email');
      return response(res, 200, 'Verification mail sent successfully');
    } catch (err) {
      next(err);
    }
  },
  async recover(req, res, next) {
    try {
      const { email } = req.query;
      const user = await User.findOne({ email });
      if (!user)
        return response(
          res,
          401,
          `The email address ${email} is not associated with any account. Double-check your email address and try again.`
        );
      await Token.updateMany(
        { user: user._id, type: 'password-reset', expired: false },
        { expired: true }
      );
      const token = await Token.create({
        token: crypto.randomBytes(20).toString('hex'),
        expiresIn: moment.utc().add(1, 'hours'),
        user,
        type: 'password-reset',
      });
      let link = `${SITE_URL}/reset/${token.token}`;
      console.log({ link });
      let subject = 'Reset Password';
      let message = `Please click on the following link ${link} to reset your password.`;
      await sendMail(
        subject,
        user.email,
        message,
        null,
        link,
        'Reset Password'
      );
      return response(
        res,
        200,
        `A reset email has been sent to ${user.email}`,
        link
      );
    } catch (err) {
      next(err);
    }
  },
  async resetPassword(req, res, next) {
    try {
      const token = await Token.findOne({
        token: req.params.token,
        type: 'password-reset',
      }).populate('user');
      if (!token)
        return response(
          res,
          400,
          'We were unable to find a valid token. Your token my have expired.'
        );
      console.log(token.user);

      if (
        token.expired ||
        moment.utc(token.expiresIn).diff(moment.utc(), 'minutes') < 0
      ) {
        // expire token
        token.expired = true;
        await token.save();
        return response(
          res,
          403,
          'Verification link expired. Please request a new one'
        );
      }
      let { user } = token;
      if (!user)
        return response(
          res,
          404,
          'Password reset link is invalid or has expired.'
        );
      // Set the new password
      user.password = req.body.password;
      user.isVerified = true;
      await user.save();
      // send email
      let subject = 'Your password has been changed';
      let text = `This is a confirmation that the password for your account ${user.email} has just been changed.\n`;
      await sendMail(subject, user.email, text);
      return response(res, 200, 'Your password has been updated.');
    } catch (err) {
      next(err);
    }
  },

  async changePassword(req, res, next) {
    try {
      if (!req.user.comparePassword(req.body.oldPassword)) {
        return response(res, 401, 'Invalid password');
      }
      // Set the new password
      req.user.password = req.body.password;
      await req.user.save();
      // send email
      let subject = 'Your password has been changed';
      let message = `This is a confirmation that the password for your account ${req.user.email} has just been changed.\n`;
      await sendMail(subject, req.user.email, message);
      return response(res, 200, 'Your password has been updated.');
    } catch (err) {
      next(err);
    }
  },
};

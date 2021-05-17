const User = require('../models/user');
const Token = require('../models/token');
const response = require('../middlewares/response');
const { findOne, find } = require('../services/queryService');
const { nanoid } = require('nanoid');
const crypto = require('crypto');
const moment = require('moment');
const { sendMail } = require('../services/message');
const _ = require('lodash');

module.exports = {
  async createNewUser(req, res, next) {
    try {
      let existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return response(res, 409, `A user with this email already exists`);
      }
      delete req.body.currentPlan;
      let password = nanoid(8);
      let user = await User.create({
        ...req.body,
        password,
        createdBy: req.user.id,
      });
      const token = await Token.create({
        token: crypto.randomBytes(20).toString('hex'),
        expiresIn: moment.utc().add(24, 'hours'),
        user: user._id,
        type: 'password-reset',
      });
      let link = `${req.headers.host}/auth/recover-password/${token.token}`;
      let subject = 'New Account';
      let message = `Your current password is <b>${password}</b>
                    <p>Please click on the following link ${link} to verify your account.</p>. This link expires in 24 hours`;
      await sendMail(subject, user.email, message, link, 'Set Password');
      return response(
        res,
        200,
        `A verification link has been sent to ${user.email}`,
        user
      );
    } catch (err) {
      next(err);
    }
  },
  async fetchAllUsers(req, res, next) {
    try {
      let conditions = {};
      if (
        !req.user ||
        (req.user && !['super-admin', 'admin'].includes(req.user.role))
      ) {
        conditions.role = 'lawyer';
        conditions.status = 'active';
      }
      if (req.query.keyword) {
        let options = ['firstName', 'lastName'];
        conditions.$or = options.map(option => {
          let o = {};
          o[option] = new RegExp(req.query.keyword, 'i');
          return o;
        });
      }
      delete req.query.keyword;
      console.log({ conditions });
      const users = await find(User, req, conditions);
      return response(res, 200, 'users fetched successfully', users);
    } catch (err) {
      return next(err);
    }
  },
  async fetchUser(req, res, next) {
    try {
      const user = await findOne(User, req, {
        _id: req.params.userId,
      });
      return response(
        res,
        200,
        user ? 'user fetched successfully' : 'user not found',
        user
      );
    } catch (err) {
      return next(err);
    }
  },
  async updateUserStatus(req, res, next) {
    try {
      let { status } = req.body;
      delete req.body.currentPlan;
      let user = await User.findById(req.params.userId);
      if (!user) {
        return response(res, 404, 'user not found');
      }
      if (String(req.user.id) === String(req.params.userId)) {
        return response(res, 401, 'user can not update own status');
      }
      if (user.status === status) {
        return response(res, 409, `user already ${user.status}`);
      }
      user.status = status;
      user.statusUpdatedBy = req.user.id;
      await user.save();
      return response(res, 200, 'user status updated');
    } catch (error) {
      next(error);
    }
  },
  async deleteUser(req, res, next) {
    try {
      let user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        return response(res, 404, 'user not found');
      }
      return response(res, 200, 'user deleted successfully');
    } catch (error) {
      next(error);
    }
  },
  async fetchProfile(req, res, next) {
    try {
      const user = await findOne(User, req, { _id: req.user.id });
      return response(
        res,
        200,
        user ? 'profile fetched successfully' : 'user not found',
        user
      );
    } catch (err) {
      return next(err);
    }
  },
  async updateProfile(req, res, next) {
    try {
      req.body = _.omit(req.body, ['status', 'role']);
      const user = await User.findByIdAndUpdate(req.user.id, {
        ...req.body,
      });
      if (!user) return response(res, 404, 'user not found');
      if (req.files) {
        if (req.files.avatar) {
          user.avatar = req.files.avatar[0].path;
        }
        if (req.files.callToBarCertificate) {
          user.callToBarCertificate = req.files.callToBarCertificate[0].path;
        }
        if (req.files.proofOfPayment) {
          user.proofOfPayment = req.files.proofOfPayment[0].path;
        }
        if (req.files.otherCertificates) {
          let arr = req.files.otherCertificates.map(file => file.path);
          user.otherCertificates.push(...arr);
        }
      }
      await user.save();
      const updatedUser = await User.findById(req.user.id);
      return response(res, 200, 'user profile updated', updatedUser);
    } catch (err) {
      return next(err);
    }
  },
  async rateUser(req, res, next) {
    try {
      if (req.user.role !== 'user') {
        return response(res, 401, 'rating is only available to users');
      }
      let { lawyerId, value } = req.body;
      let lawyer = await User.findOne({ _id: lawyerId, role: 'lawyer' });
      if (!lawyer) {
        return response(res, 404, 'lawyer not found');
      }
      let rating = await Rating.findOneAndUpdate(
        { user: req.user.id, lawyer: lawyer._id },
        { value }
      );
      if (!rating) {
        rating = await Rating.create({ user: req.user.id, lawyer, value });
      }
      await lawyer.updateRating();
      await rating.save();
      return response(res, 200, 'rating saveed successfully', rating);
    } catch (error) {
      next(error);
    }
  },
};

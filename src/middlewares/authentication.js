const getJWT = require('../services/jwt.service');
const { User } = require('../models');
const response = require('./response');

module.exports = function authenticateUser(req, res, next) {
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        const token = credentials;
        getJWT.decodeToken(token, async (err, decodedToken) => {
          if (err) {
            return response(res, 400, err.message);
          }
          try {
            req.user = await User.findById(decodedToken.id);
            if (!req.user) {
              return response(res, 401, 'invalid token');
            }
            if (!req.user.isVerified) {
              return response(res, 401, 'please verify your email to continue');
            }
            next();
          } catch (error) {
            return response(res, 401, error.message);
          }
        });
      } else {
        return response(res, 401, 'Format is Authorization: Bearer [token]');
      }
    } else {
      return response(res, 401, 'Format is Authorization: Bearer [token]');
    }
  } else {
    return response(res, 401, 'No authorization header was found');
  }
};

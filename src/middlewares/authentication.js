const getJWT = require('../services/jwtService');
const User = require('../models/user');
const response = require('./response');

module.exports = {
  authenticate(req, res, next) {
    if (req.allowPass && !(req.headers || req.headers.authorization)) {
      next();
    }
    if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          const token = credentials;
          getJWT.decodeToken(token, async (err, decoded) => {
            if (err) {
              return response(res, 400, err.message);
            }
            try {
              req.user = await User.findById(decoded.id);
              if (!req.user) {
                return response(res, 401, 'invalid token');
              }
              if (req.user.status !== 'active' && req.user.role !== "user") {
                return response(res, 401, 'you are not authorized to do this');
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
  },
  isAdmin(roles = []) {
    return async function checkIfAdmin(req, res, next) {
      try {
        if (req.allowPass) {
          next();
        }
        if (!req.user) {
          return response(
            res,
            401,
            'You are not authorised to perform this action.'
          );
        }
        if (['superadmin', 'admin'].includes(req.user.role)) {
          return next();
        }
        if (roles.length) {
          if (!roles.includes(req.user.role)) {
            return response(
              res,
              401,
              'You are not authorised to perform this action.'
            );
          }
          return next();
        }
        return next();
      } catch (error) {
        return response(res, 500, error.message);
      }
    };
  },
  setPass(req, res, next) {
    req.allowPass = true;
    next();
  },
  authenticateAndAllowPass(req, res, next) {
    if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          const token = credentials;
          getJWT.decodeToken(token, async (err, decoded) => {
            if (err) {
              return response(res, 400, err.message);
            }
            try {
              req.user = await User.findById(decoded.id);
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
      next();
    }
  },
};

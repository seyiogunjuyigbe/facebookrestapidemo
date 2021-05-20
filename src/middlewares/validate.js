const { validationResult } = require('express-validator');
const response = require('./response');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = {};
    // eslint-disable-next-line
    errors.array().forEach((err) => (error[err.param] = err.msg));
    response(res, 400, 'request validation failed', error);
    return;
  }

  next();
};

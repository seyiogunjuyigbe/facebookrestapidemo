const Models = require('../models');
const response = require('./response');

module.exports = function checkUserPrivilege(
  model,
  role = 'author',
  field = '_id'
) {
  return async function (req, res, next) {
    try {
      if (Models[model]) {
        const condition = {};
        if (req.params) {
          // eslint-disable-next-line
          condition[field] = Object.values(req.params)[0];
        }
        const document = await Models[model].findOne(condition);
        if (!document)
          return response(res, 404, `${model.toLowerCase()} not found`);
        if (String(document[role]) !== String(req.user.id)) {
          return response(
            res,
            403,
            'You are not authorized to perform this action'
          );
        }
        next();
      } else {
        return response(res, 400, 'invalid collection selected');
      }
    } catch (err) {
      next(err);
    }
  };
};

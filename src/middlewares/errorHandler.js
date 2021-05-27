const { startCase } = require('lodash');
const pluralize = require('pluralize');

// eslint-disable-next-line
module.exports = function errorHandler(err, req, res, next) {
  // console.error({ err });

  if (err.code === 'ENOTFOUND') {
    return res.status(500).json({
      message: 'Service not available at the moment. Please try again later',
      data: null,
    });
  }

  if (
    err.message &&
    err.message.includes('Cast to ObjectId failed for value')
  ) {
    return res.status(400).json({
      message: `invalid parameter sent ${err.message ? err.message : null}`,
      data: null,
    });
  }
  if (err.message && err.message.includes('Unsupported video format or file')) {
    return res.status(400).json({
      message: `invalid media file sent`,
      data: null,
    });
  }
  if (err.code === 11000) {
    const vars = err.message.split(':');
    const tableName = vars[1].split(' ')[1].split('.')[1];
    const modelName = startCase(pluralize.singular(tableName));
    const fieldName = vars[2].split(' ')[1].split('_')[0];
    // console.log({
    //   err,
    //   vars,
    //   tableName,
    //   modelName,
    //   fieldName,
    // });
    return res.status(400).json({
      message: `${modelName} with the ${fieldName} exists`,
      data: null,
    });
  }
  if (err.message) {
    if (err.message.match(/validation failed/i)) {
      const message = err.message.replace(/[^]*validation failed: /g, '');
      return res.status(400).json({ message, data: null });
    }
  }
  if (/^5/.test(err.status) || !err.status) {
    const { message } = err;
    return res.status(500).json({ message, data: null });
  }

  if (err.response) {
    const errorText = JSON.parse(err.response.text);

    if (errorText) {
      return res
        .status(400)
        .json({ message: errorText.message || errorText.error, data: null });
    }
  }

  if (err) {
    return res.status(err.status).json({ message: err.message, data: null });
  }

  res.status(404).json({ message: 'Not Found' });
};

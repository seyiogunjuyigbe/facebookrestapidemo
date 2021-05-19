const authenticate = require('./authentication');
const checkUserPrivilege = require('./checkUserPrivilege');
const errorHandler = require('./errorHandler');
const upload = require('./multer');
const response = require('./response');
const validate = require('./validate');

module.exports = {
    authenticate,
    checkUserPrivilege,
    errorHandler,
    upload,
    response,
    validate
}
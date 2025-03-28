const { validationResult } = require('express-validator');
const ErrorResponse = require('../utils/errors');

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ErrorResponse(errors.array()[0].msg, 400));
  }
  next();
};
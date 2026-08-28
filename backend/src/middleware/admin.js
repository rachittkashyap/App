const ApiError = require('../utils/ApiError');

function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required', 'NO_TOKEN'));
  }
  if (req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Admin access required', 'FORBIDDEN'));
  }
  next();
}

module.exports = authorizeAdmin;

const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/jwt');

function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new ApiError(401, 'Authentication required', 'NO_TOKEN');
    }

    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, role: decoded.role };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired access token', 'INVALID_TOKEN'));
  }
}

module.exports = authenticateUser;

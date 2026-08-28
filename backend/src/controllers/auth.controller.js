const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { isValidEmail, isValidPassword } = require('../utils/validation');
const authService = require('../services/auth.service');

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  // Frontend (Netlify) and backend (Render) are on different domains, so this
  // is a cross-site request. Cookies only survive cross-site XHR/fetch calls
  // when SameSite=None + Secure - "lax" silently drops the cookie on every
  // request except a top-level navigation, which caused refresh (and hence
  // session restore on page reload) to always fail.
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth',
};

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE_NAME, token, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth', secure: true, sameSite: 'none' });
}

async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword, phone, college, qualification } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      throw new ApiError(400, 'Name, email, password and confirmPassword are required', 'VALIDATION_ERROR');
    }
    if (!isValidEmail(email)) {
      throw new ApiError(400, 'Please provide a valid email address', 'VALIDATION_ERROR');
    }
    if (!isValidPassword(password)) {
      throw new ApiError(400, 'Password must be at least 6 characters', 'VALIDATION_ERROR');
    }
    if (password !== confirmPassword) {
      throw new ApiError(400, 'Passwords do not match', 'VALIDATION_ERROR');
    }

    const user = await authService.registerUser({ name, email, password, phone, college, qualification });

    success(
      res,
      {
        message: 'Registration successful. Please check your email to verify your account.',
        user: user.toSafeJSON(),
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

async function verifyEmailHandler(req, res, next) {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      throw new ApiError(400, 'Email and token are required', 'VALIDATION_ERROR');
    }

    const user = await authService.verifyEmail({ email, token });
    success(res, { message: 'Email verified successfully', user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required', 'VALIDATION_ERROR');
    }

    const { user, accessToken, refreshToken } = await authService.loginUser({ email, password });

    setRefreshCookie(res, refreshToken);
    success(res, {
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new ApiError(401, 'No refresh token provided', 'NO_REFRESH_TOKEN');
    }

    const { user, accessToken, refreshToken } = await authService.refreshTokens(token);

    setRefreshCookie(res, refreshToken);
    success(res, {
      accessToken,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    clearRefreshCookie(res);
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    if (req.user) {
      await authService.logoutUser(req.user.id);
    }
    clearRefreshCookie(res);
    success(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function forgotPasswordHandler(req, res, next) {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'Please provide a valid email address', 'VALIDATION_ERROR');
    }

    await authService.forgotPassword(email);

    // Always respond the same way, whether or not the email exists
    success(res, { message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

async function resetPasswordHandler(req, res, next) {
  try {
    const { email, token, newPassword, confirmNewPassword } = req.body;

    if (!email || !token || !newPassword || !confirmNewPassword) {
      throw new ApiError(400, 'All fields are required', 'VALIDATION_ERROR');
    }
    if (!isValidPassword(newPassword)) {
      throw new ApiError(400, 'Password must be at least 6 characters', 'VALIDATION_ERROR');
    }
    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, 'Passwords do not match', 'VALIDATION_ERROR');
    }

    await authService.resetPassword({ email, token, newPassword });
    success(res, { message: 'Password has been reset. Please log in with your new password.' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }
    success(res, { user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  verifyEmailHandler,
  login,
  refresh,
  logout,
  forgotPasswordHandler,
  resetPasswordHandler,
  me,
};

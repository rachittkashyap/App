const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateToken, hashToken } = require('../utils/crypto');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const emailService = require('./email.service');

const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function registerUser({ name, email, password, phone, college, qualification }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists', 'EMAIL_TAKEN');
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    phone,
    college,
    qualification,
  });

  const rawToken = generateToken();
  user.verificationTokenHash = hashToken(rawToken);
  user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);
  await user.save();

  await emailService.sendVerificationEmail(user, rawToken);

  return user;
}

async function verifyEmail({ email, token }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+verificationTokenHash +verificationTokenExpires'
  );

  if (!user || !user.verificationTokenHash) {
    throw new ApiError(400, 'Invalid or expired verification link', 'INVALID_TOKEN');
  }

  if (user.verificationTokenExpires < new Date()) {
    throw new ApiError(400, 'Verification link has expired', 'TOKEN_EXPIRED');
  }

  if (hashToken(token) !== user.verificationTokenHash) {
    throw new ApiError(400, 'Invalid verification link', 'INVALID_TOKEN');
  }

  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  await emailService.sendWelcomeEmail(user);

  return user;
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account has been suspended', 'ACCOUNT_SUSPENDED');
  }

  const match = await user.comparePassword(password);
  if (!match) {
    throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.isVerified) {
    throw new ApiError(403, 'Please verify your email before logging in', 'EMAIL_NOT_VERIFIED');
  }

  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

async function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();

  return { accessToken, refreshToken };
}

async function refreshTokens(oldRefreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(oldRefreshToken);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token', 'INVALID_REFRESH_TOKEN');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    throw new ApiError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }

  if (hashToken(oldRefreshToken) !== user.refreshTokenHash) {
    // Refresh token reuse / mismatch - revoke session for safety
    user.refreshTokenHash = undefined;
    await user.save();
    throw new ApiError(401, 'Refresh token has been revoked', 'REFRESH_TOKEN_REVOKED');
  }

  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

async function forgotPassword(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Do not reveal whether the email exists - always respond the same way from the controller
  if (!user) return;

  const rawToken = generateToken();
  user.resetPasswordTokenHash = hashToken(rawToken);
  user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await user.save();

  await emailService.sendPasswordResetEmail(user, rawToken);
}

async function resetPassword({ email, token, newPassword }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+resetPasswordTokenHash +resetPasswordExpires'
  );

  if (!user || !user.resetPasswordTokenHash) {
    throw new ApiError(400, 'Invalid or expired reset link', 'INVALID_TOKEN');
  }

  if (user.resetPasswordExpires < new Date()) {
    throw new ApiError(400, 'Reset link has expired', 'TOKEN_EXPIRED');
  }

  if (hashToken(token) !== user.resetPasswordTokenHash) {
    throw new ApiError(400, 'Invalid reset link', 'INVALID_TOKEN');
  }

  user.password = newPassword; // will be hashed by pre-save hook
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  user.refreshTokenHash = undefined; // force re-login on all devices
  await user.save();
}

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  issueTokens,
  refreshTokens,
  logoutUser,
  forgotPassword,
  resetPassword,
};

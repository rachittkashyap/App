const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/response');
const { isValidPassword } = require('../utils/validation');

async function updateProfile(req, res, next) {
  try {
    const { name, phone, college, qualification, profilePhoto } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (college !== undefined) user.college = college;
    if (qualification !== undefined) user.qualification = qualification;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;

    await user.save();

    success(res, { message: 'Profile updated successfully', user: user.toSafeJSON() });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      throw new ApiError(400, 'All fields are required', 'VALIDATION_ERROR');
    }
    if (!isValidPassword(newPassword)) {
      throw new ApiError(400, 'New password must be at least 6 characters', 'VALIDATION_ERROR');
    }
    if (newPassword !== confirmNewPassword) {
      throw new ApiError(400, 'New passwords do not match', 'VALIDATION_ERROR');
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found', 'NOT_FOUND');
    }

    const match = await user.comparePassword(currentPassword);
    if (!match) {
      throw new ApiError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS');
    }

    user.password = newPassword; // hashed by pre-save hook
    user.refreshTokenHash = undefined; // force re-login on all other sessions
    await user.save();

    success(res, { message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, changePassword };

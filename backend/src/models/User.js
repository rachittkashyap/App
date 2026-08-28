const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },

    role: { type: String, enum: ['STUDENT', 'ADMIN'], default: 'STUDENT' },

    phone: { type: String, default: '' },
    college: { type: String, default: '' },
    qualification: { type: String, default: '' },
    profilePhoto: { type: String, default: '' },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    verificationTokenHash: { type: String, select: false },
    verificationTokenExpires: { type: Date, select: false },

    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    refreshTokenHash: { type: String, select: false },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was modified
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Never expose sensitive fields in JSON responses
userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    college: this.college,
    qualification: this.qualification,
    profilePhoto: this.profilePhoto,
    isVerified: this.isVerified,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const internshipApplicationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    courseOrDegree: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    tenthPercentage: { type: String, required: true, trim: true },
    twelfthPercentage: { type: String, required: true, trim: true },
    internshipType: {
      type: String,
      required: true,
      enum: [
        'Full Stack Development',
        'Frontend Development',
        'Backend Development',
        'Java Development',
        'Node.js Development',
        'UI/UX',
      ],
    },

    resumeFileName: { type: String, required: true },
    resumeContentType: { type: String, required: true },
    resumeData: { type: Buffer, required: true },

    status: {
      type: String,
      enum: ['NEW', 'REVIEWED', 'SHORTLISTED', 'REJECTED'],
      default: 'NEW',
    },
  },
  { timestamps: true }
);

// Never send the raw file buffer back in list views - only via the
// dedicated resume-download endpoint
internshipApplicationSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    phone: this.phone,
    courseOrDegree: this.courseOrDegree,
    college: this.college,
    tenthPercentage: this.tenthPercentage,
    twelfthPercentage: this.twelfthPercentage,
    internshipType: this.internshipType,
    resumeFileName: this.resumeFileName,
    status: this.status,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('InternshipApplication', internshipApplicationSchema);

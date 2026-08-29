const mongoose = require('mongoose');

const certificateTemplateSchema = new mongoose.Schema(
  {
    // Only one template document exists at a time (singleton pattern below)
    organizationName: { type: String, default: 'Training Platform' },
    titleText: { type: String, default: 'Certificate of Completion' },
    bodyText: {
      type: String,
      default: 'This is to certify that {{studentName}} has successfully completed {{itemTitle}}.',
    },
    signatureName: { type: String, default: '' },
    signatureTitle: { type: String, default: '' },
    accentColor: { type: String, default: '#4f46e5' },
  },
  { timestamps: true }
);

// Always returns the single template, creating a default one on first use
certificateTemplateSchema.statics.getOrCreate = async function getOrCreate() {
  let template = await this.findOne();
  if (!template) {
    template = await this.create({});
  }
  return template;
};

module.exports = mongoose.model('CertificateTemplate', certificateTemplateSchema);

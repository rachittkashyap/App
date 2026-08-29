const Certificate = require('../models/Certificate');
const { generateCertificateId } = require('../utils/certificateId');

// Called right after an enrollment's isCompleted flips to true. Safe to call
// multiple times - the unique index on (student, itemType, itemId) plus this
// existence check keep it idempotent.
async function issueCertificateIfEligible({ studentId, studentName, itemType, itemId, itemTitle }) {
  const existing = await Certificate.findOne({ student: studentId, itemType, itemId });
  if (existing) return existing;

  // Retry a couple of times in the astronomically unlikely event of a
  // certificateId collision (unique index would reject a duplicate insert).
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const certificate = await Certificate.create({
        student: studentId,
        itemType,
        itemId,
        studentName,
        itemTitle,
        certificateId: generateCertificateId(),
      });
      return certificate;
    } catch (err) {
      if (err.code === 11000 && attempt < 2) continue; // duplicate certificateId - retry
      throw err;
    }
  }
  return null;
}

module.exports = { issueCertificateIfEligible };

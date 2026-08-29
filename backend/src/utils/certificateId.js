const crypto = require('crypto');

// Non-sequential, non-predictable, human-shareable certificate ID.
// e.g. CERT-9F3A1B2C7D4E
function generateCertificateId() {
  const random = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `CERT-${random}`;
}

module.exports = { generateCertificateId };

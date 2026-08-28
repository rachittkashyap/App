const crypto = require('crypto');

// Generates a random token to send to the user (in email/link)
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Hashes a token before storing in DB - we never store the raw token
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = { generateToken, hashToken };

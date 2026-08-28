/**
 * Email Service (Phase 2 version)
 * --------------------------------
 * For now this just logs the email content + link to the server console
 * instead of sending a real email. This lets registration/login/password
 * reset be fully testable without needing SMTP credentials.
 *
 * In Phase 9 this will be replaced with a Redis/BullMQ queue + Nodemailer
 * worker, but the function signatures below will stay the same so nothing
 * else in the codebase needs to change.
 */

function logEmail(to, subject, body) {
  console.log('\n========== EMAIL (dev mode - not actually sent) ==========');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:\n' + body);
  console.log('============================================================\n');
}

async function sendVerificationEmail(user, rawToken) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;
  logEmail(
    user.email,
    'Verify your email',
    `Hi ${user.name},\n\nPlease verify your email by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`
  );
}

async function sendWelcomeEmail(user) {
  logEmail(user.email, 'Welcome!', `Hi ${user.name},\n\nYour email is verified. Welcome to the platform!`);
}

async function sendPasswordResetEmail(user, rawToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;
  logEmail(
    user.email,
    'Reset your password',
    `Hi ${user.name},\n\nYou requested a password reset. Open this link to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`
  );
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};

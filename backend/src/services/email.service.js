const EmailJob = require('../models/EmailJob');
const { getEmailQueue } = require('../queues/email.queue');

/**
 * Email Service (Phase 9)
 * ------------------------
 * Every email is first recorded as an EmailJob (so it always shows up in the
 * admin Email Logs page), then either:
 *  - enqueued to BullMQ for the worker to send via SMTP (when REDIS_URL is set), or
 *  - logged to the console and marked SENT immediately (dev-mode fallback,
 *    same as Phase 2-8 behaviour, used when Redis isn't configured yet).
 *
 * Callers never need to know which path was taken - the function signatures
 * are unchanged from before.
 */

function logToConsole(to, subject, body) {
  console.log('\n========== EMAIL (dev mode - not actually sent) ==========');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:\n' + body);
  console.log('============================================================\n');
}

async function dispatchEmail({ to, subject, body, type }) {
  const emailJob = await EmailJob.create({ to, subject, body, type, status: 'PENDING' });

  const queue = getEmailQueue();

  if (!queue) {
    // Dev-mode fallback - no Redis configured yet
    logToConsole(to, subject, body);
    emailJob.status = 'SENT';
    emailJob.sentAt = new Date();
    await emailJob.save();
    return emailJob;
  }

  await queue.add('send-email', { emailJobId: emailJob._id.toString() });
  return emailJob;
}

async function sendVerificationEmail(user, rawToken) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;
  await dispatchEmail({
    to: user.email,
    subject: 'Verify your email',
    body: `Hi ${user.name},\n\nPlease verify your email by opening this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    type: 'VERIFY_EMAIL',
  });
}

async function sendWelcomeEmail(user) {
  await dispatchEmail({
    to: user.email,
    subject: 'Welcome!',
    body: `Hi ${user.name},\n\nYour email is verified. Welcome to the platform!`,
    type: 'WELCOME',
  });
}

async function sendPasswordResetEmail(user, rawToken) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    user.email
  )}`;
  await dispatchEmail({
    to: user.email,
    subject: 'Reset your password',
    body: `Hi ${user.name},\n\nYou requested a password reset. Open this link to set a new password:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    type: 'PASSWORD_RESET',
  });
}

async function sendCertificateReadyEmail(user, certificate) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-certificate/${certificate.certificateId}`;
  await dispatchEmail({
    to: user.email,
    subject: 'Your certificate is ready!',
    body: `Hi ${user.name},\n\nCongratulations on completing "${certificate.itemTitle}"! Your certificate (${certificate.certificateId}) is ready to download from your dashboard.\n\nVerify it anytime at: ${verifyUrl}`,
    type: 'CERTIFICATE_READY',
  });
}

async function sendPaymentConfirmationEmail(user, order) {
  await dispatchEmail({
    to: user.email,
    subject: 'Payment received',
    body: `Hi ${user.name},\n\nWe've received your payment of ₹${(order.amount / 100).toFixed(2)} for "${order.itemTitle}". You're now enrolled - happy learning!`,
    type: 'PAYMENT',
  });
}

async function sendSubmissionReviewedEmail(user, submission) {
  await dispatchEmail({
    to: user.email,
    subject: `Your assignment has been reviewed: ${submission.status}`,
    body: `Hi ${user.name},\n\nYour assignment submission has been reviewed.\nResult: ${submission.status}${
      submission.score != null ? `\nScore: ${submission.score}` : ''
    }${submission.feedback ? `\nFeedback: ${submission.feedback}` : ''}`,
    type: 'SUBMISSION_REVIEWED',
  });
}

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendCertificateReadyEmail,
  sendPaymentConfirmationEmail,
  sendSubmissionReviewedEmail,
};

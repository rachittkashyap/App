const { Worker } = require('bullmq');
const EmailJob = require('../models/EmailJob');
const { getRedisConnection } = require('../config/redis');
const { getMailTransporter } = require('../config/mailer');

let worker = null;

// Starts the worker if Redis is configured. Safe to call even if it isn't -
// it just no-ops so the server keeps working with the dev-mode console
// fallback in email.service.js.
function startEmailWorker() {
  if (worker) return worker;

  const connection = getRedisConnection();
  if (!connection) {
    console.log('Email worker not started: REDIS_URL is not configured (using dev-mode email fallback).');
    return null;
  }

  worker = new Worker(
    'email',
    async (job) => {
      const emailJob = await EmailJob.findById(job.data.emailJobId);
      if (!emailJob) throw new Error('EmailJob record not found');

      emailJob.status = 'PROCESSING';
      emailJob.attempts += 1;
      await emailJob.save();

      const transporter = getMailTransporter();
      if (!transporter) {
        throw new Error('SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD missing)');
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: emailJob.to,
        subject: emailJob.subject,
        text: emailJob.body,
      });

      emailJob.status = 'SENT';
      emailJob.sentAt = new Date();
      emailJob.lastError = '';
      await emailJob.save();
    },
    { connection, concurrency: 5 }
  );

  worker.on('failed', async (job, err) => {
    console.error(`Email job ${job?.id} failed:`, err.message);
    if (job?.data?.emailJobId) {
      await EmailJob.findByIdAndUpdate(job.data.emailJobId, {
        status: 'FAILED',
        lastError: err.message,
      }).catch(() => {});
    }
  });

  console.log('Email worker started, listening for jobs on the "email" queue.');
  return worker;
}

module.exports = { startEmailWorker };

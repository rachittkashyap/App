const { Queue } = require('bullmq');
const { getRedisConnection } = require('../config/redis');

let queue = null;
let attempted = false;

function getEmailQueue() {
  if (attempted) return queue;
  attempted = true;

  const connection = getRedisConnection();
  if (!connection) return null;

  queue = new Queue('email', {
    connection,
    defaultJobOptions: {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 }, // 5s, 10s, 20s, 40s, 80s
      removeOnComplete: { age: 7 * 24 * 60 * 60 }, // keep completed jobs 7 days
      removeOnFail: false, // keep failed jobs so admin can see/retry them
    },
  });

  return queue;
}

module.exports = { getEmailQueue };

const IORedis = require('ioredis');

let connection = null;
let attempted = false;

function getRedisConnection() {
  if (attempted) return connection;
  attempted = true;

  const url = process.env.REDIS_URL;
  if (!url) return null;

  connection = new IORedis(url, {
    maxRetriesPerRequest: null, // required by BullMQ
  });

  connection.on('error', (err) => {
    console.error('Redis connection error:', err.message);
  });

  return connection;
}

module.exports = { getRedisConnection };

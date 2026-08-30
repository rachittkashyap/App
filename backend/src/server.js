require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startEmailWorker } = require('./workers/email.worker');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // Runs in the same process as the web server - fine for this deployment
  // size. If email volume grows, this can be split into its own worker
  // service that just calls startEmailWorker() and nothing else.
  startEmailWorker();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  });
}

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

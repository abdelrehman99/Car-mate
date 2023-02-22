const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXECPTION! Shutting down...');

  // 0 for success and 1 for unhandled rejection here it's nessacry to shut down the server because the node process is not clean
  process.exit(1);
});

const app = require('./app');

// Conecting to DB
if (process.env.NODE_ENV === 'development')
  dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('DB connection successful!'))
  .catch(() => console.log('DB not connected'));

// starting a server
const port = process.env.PORT || 3000;
const server = app.listen(3000, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! Shutting down...');

  // 0 for success and 1 for unhandled rejection not neccassry to close but a good practice
  server.close(() => {
    process.exit(1);
  });
});

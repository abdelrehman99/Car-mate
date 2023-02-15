const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');

// Conecting to DB
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

const express = require('express');
const UserRouter = require('./Routes/UserRouter');
const productRouter = require('./Routes/productRouter');
const AppError = require('./utils/apperror');
const errorhandeler = require('./Controllers/errrorcontroller');
const app = express();
const morgan = require('morgan');
var cors = require('cors');

// MiddleWare
app.use(cors());
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.url);
  console.log(req.body);
  next();
});
app.use(morgan('dev'));
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/prodcuts', productRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorhandeler);

module.exports = app;

// Test git

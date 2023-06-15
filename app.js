const express = require('express');
const morgan = require('morgan');
var cors = require('cors');
const UserRouter = require('./Routes/UserRouter');
const productRouter = require('./Routes/productRouter');
const rentRouter = require('./Routes/RentRouter');
const errorhandeler = require('./Controllers/errrorcontroller');
const prodcutController = require('./Controllers/productController');
const rentController = require('./Controllers/rentController');
const AppError = require('./utils/apperror');
const app = express();

// MiddleWare
app.use(cors());
app.post(
  '/web-hook',
  express.raw({ type: 'application/json' }),
  prodcutController.webhook
);
app.use(express.json());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.url);
  console.log(req.body);
  next();
});
app.use(morgan('dev'));
app.use('/api/v1/users', UserRouter);
app.use('/api/v1/prodcuts', productRouter);
app.use('/api/v1/rents', rentRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorhandeler);

module.exports = app;

// Test git

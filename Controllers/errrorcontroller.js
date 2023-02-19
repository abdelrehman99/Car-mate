const AppError = require('./../utils/apperror');

const HandleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const HandleDuplicateFieldsDb = (err) => {
  const arr = Object.keys(err.keyValue),
    value = err.keyValue[arr[0]];

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const HandleValidationErrorDb = (err) => {
  const errors = Object.keys(err.errors).map(
    (el) => err.errors[el].properties.message
  );

  // console.log(err.errors);
  const message = `Inavalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const HandleJWTError = () =>
  new AppError('This token is invalid, please log in again', 401);

const HandleJWTExpired = () =>
  new AppError('This token is expired, please log in again', 401);

const SendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const SendProdError = (err, res) => {
  // User error like accesing bad route
  if (err.IsOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // bug
  else {
    // console.error('ERROR ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log(err);

  if (process.env.NODE_ENV === 'development') SendDevError(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.IsOperational) return SendProdError(err, res);

    console.log(error);
    if (error.name === 'CastError') error = HandleCastErrorDb(error);
    if (error.code === 11000) error = HandleDuplicateFieldsDb(error);
    if (error.name === 'JsonWebTokenError') error = HandleJWTError();
    if (error.name === 'TokenExpiredError') error = HandleJWTExpired();
    if (error._message && error._message.startsWith('User validation failed'))
      error = HandleValidationErrorDb(error);

    SendProdError(error, res);
  }
};

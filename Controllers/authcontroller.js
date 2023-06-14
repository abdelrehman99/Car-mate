const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const CatchAsync = require('../utils/catchasync');
const AppError = require('./../utils/apperror');
const { promisify } = require('util');
const catchAsync = require('./../utils/catchasync');
const email = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const respond = (res, statusCode, user, token) => {
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: { user },
    });
  } else {
    res.status(statusCode).json({
      status: 'success',
      token,
    });
  }
};

exports.signup = CatchAsync(async (req, res, next) => {
  // console.log(req);
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    ConfirmPassword: req.body.ConfirmPassword,
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    PhoneNumber: req.body.PhoneNumber,
    PasswordChangedAt: new Date(),
    role: req.body.role,
  });

  // newUser.save();
  const token = signToken(newUser._id);
  respond(res, 201, newUser, token);
});

exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const token = signToken(user._id);
  respond(res, 200, user, token);
});

exports.ProtectRoutes = CatchAsync(async (req, res, next) => {
  let token;
  // check if the request has a token
  const header = req.headers.authorization;

  // console.log(header);
  if (header && header.startsWith('Bearer')) {
    token = header.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in please log in first.', 401)
    );

  // check if the token is valid
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // get the user belonging to the id and check if he deleted the account or not
  const CurrentUser = await User.findById(decoded.id);
  if (!CurrentUser)
    return next(new AppError('This User no longer exists', 401));
  // console.log(CurrentUser);

  // check if the user changed his password
  if (CurrentUser.ChangedPassword(decoded.iat))
    return next(
      new AppError('User has changed password. Please log in again', 401)
    );

  req.user = CurrentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles = ['admin']
    if (!roles.includes(req.user.role))
      return next(
        new AppError('This user is not allowed to perform this task', 403)
      );

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // check if this email exists
  if (!user) return next(new AppError('This user email does not exist', 404));

  // Generate a random reset password token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send email to user from car mate
  try {
    await email({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message: `This is the password reset token \n ${resetToken} \n 
      PLEASE do not share this token with anyone and it submit to the application`,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token is sent to email. Please check your mail and spam folder',
    });
  } catch (err) {
    // reseting the password reset token in case of err
    user.passwordResetToken = undefined;
    user.PasswordResetExpiry = undefined;

    console.error(err);
    // not validating before saving
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = CatchAsync(async (req, res, next) => {
  // hashing the token to query on it in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  console.log(hashedToken);
  // checking if the token is valid
  const user = await User.findOne({
    PasswordResetToken: hashedToken,
    PasswordResetExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('This token is invalid or has expired', 400));
  }

  // Changing user password and reseting the password reset token
  user.password = req.body.password;
  user.ConfirmPassword = req.body.ConfirmPassword;
  user.passwordResetToken = undefined;
  user.PasswordResetExpiry = undefined;

  // saving to database and if there is validation error it's caught global in CatchAsync
  await user.save();

  // creating new login token
  const token = signToken(user._id);

  // responding with token
  respond(res, 200, user, token);
});

exports.updatePassword = CatchAsync(async (req, res, next) =>
{
  // check if user has the correct password
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect password', 401));
  }
  
});

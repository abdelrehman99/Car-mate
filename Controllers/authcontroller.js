const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const CatchAsync = require('../utils/catchasync');
const AppError = require('./../utils/apperror');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = CatchAsync(async (req, res, next) => {
  // console.log(req);
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    ConfirmPassword: req.body.ConfirmPassword,
  });

  // newUser.save();
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
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
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

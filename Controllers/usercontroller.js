const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchasync');
const Products = require('./../models/ProductModel');
const AppError = require('../utils/apperror');

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('Owns Purchased');

  res.status(200).json({
    message: 'success',
    data: {
      user,
    },
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().populate('Owns Purchased');
  res.status(201).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.deleteAll = catchAsync(async (req, res, next) => {
  const done = await User.deleteMany();
  res.status(200).json({
    status: 'success',
  });
});

exports.Favourite = catchAsync(async (req, res, next) => {
  const product = await Products.findById(req.params.id);
  if (!product) return next(new AppError('This product does not exisit', 404));
  // req.user.Favorites = [];
  req.user.Favorites.push(req.params.id);
  const user = await User.findByIdAndUpdate(req.user._id, req.user, {
    new: true,
    runValidators: true,
  });
  res.status(201).json({
    status: 'success',
    results: user,
  });
});

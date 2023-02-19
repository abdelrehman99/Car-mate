const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchasync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
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

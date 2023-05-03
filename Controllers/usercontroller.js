const User = require('./../models/UserModel');
const catchAsync = require('./../utils/catchasync');

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    message: 'success',
    data: {
      user,
    },
  });
});

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

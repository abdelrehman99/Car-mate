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

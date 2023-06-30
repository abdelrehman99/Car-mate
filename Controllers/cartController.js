const Cart = require('./../models/CartModel');
const catchAsync = require('./../utils/catchasync');

exports.deleteAll = catchAsync(async (req, res, next) => {
  const done = await Cart.deleteMany();
  res.status(200).json({
    status: 'success',
  });
});

const Cart = require('./../models/CartModel');
const catchAsync = require('./../utils/catchasync');

// exports.addCart = catchAsync(async (req, res, next) => {
//   const cart = await Cart.findById(req.params.id).populate('Owns Purchased');

//   res.status(200).json({
//     message: 'success',
//     data: {
//       cart,
//     },
//   });
// });

// exports.getCart = catchAsync(async (req, res, next) => {
//   const cart = await Cart.findById(req.params.id).populate('Owns Purchased');

//   res.status(200).json({
//     message: 'success',
//     data: {
//       cart,
//     },
//   });
// });

// exports.getAllCarts = catchAsync(async (req, res, next) => {
//   const carts = await Cart.find().populate('Owns Purchased');
//   res.status(201).json({
//     status: 'success',
//     results: carts.length,
//     data: {
//       carts,
//     },
//   });
// });

exports.deleteAll = catchAsync(async (req, res, next) => {
  const done = await Cart.deleteMany();
  res.status(200).json({
    status: 'success',
  });
});

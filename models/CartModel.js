const mongoose = require('mongoose');
const AppError = require('../utils/apperror');

const cartSchema = new mongoose.Schema({
  Products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'product',
    },
  ],
  Quantity: [
    {
      type: Number,
    },
  ],
  User: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: Date,
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;

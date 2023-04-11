const mongoose = require('mongoose');
const validator = require('validator');

const required_msg = function(value) {
  return `Please provide a ${value} for your product`;
};

const locationSchema = new mongoose.Schema({
  // GeoJson to specify location
  type: {
    type: String,
    default: 'Point',
    enum: {
      values: ['Point'],
      message: '{VALUE} is not supported',
    },
  },
  // for lat and lang
  Cordinates: [Number],
  Address: String,
  // Description: String,
});

const productSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, required_msg('Name')],
  },
  Condition: {
    type: String,
    required: [true, required_msg('Condition')],
  },
  Ratings: {
    type: Number,
    default: 0,
  },
  imageCover: String,
  Images: [String],
  Description: {
    type: String,
    required: [true, required_msg('Description')],
  },
  Price: {
    type: Number,
    required: [true, required_msg('Price')],
  },
  Location: {
    type: locationSchema,
    required: [true, required_msg('Location')],
  },
  Quantity: {
    type: Number,
    required: [true, required_msg('Quantity')],
  },
  Sold: {
    type: Number,
    default: 0,
  },
  Owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  Buyers: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  Type: {
    type: String,
    required: [true, required_msg('Type')],
  },
});

const product = mongoose.model('product', productSchema);
module.exports = product;

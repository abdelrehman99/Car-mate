const mongoose = require('mongoose');
const AppError = require('../utils/apperror');
// const Rating = require('./RatingModel');

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

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  Rating: {
    type: Number,
    min: 0,
    max: 5,
    required: [true, 'Please provide a rating'],
  },
  Description: {
    type: String,
    required: [true, 'Please provide an Description'],
  },
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
  RatingsAverage: {
    type: Number,
    default: 0.0,
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
  Ratings: [
    {
      type: ratingSchema,
      default: () => ({}),
    },
  ],
  RatingsSum: {
    type: Number,
    default: 0,
  },
  Type: {
    type: String,
    enum: {
      values: ['Car', 'Accessories', 'Car Parts'],
      message: '{VALUE} Type must be Car, Accesssories or Car Parts',
    },
    required: [true, required_msg('Type')],
  },
  createdAt: Date,
});

// productSchema.pre(/^find/, function(next) {
//   this.populate('Buyers Owner');
//   next();
// });

// productSchema.post(/^find/, function() {
//   // this.populate('Buyers Owner');
//   // console.log(this);
//   if (!this._id) 
//   // next();
// });

productSchema.pre('save', function(next) {
  this.RatingsAverage = this.RatingsSum / this.Ratings.length;
  next();
});

const product = mongoose.model('product', productSchema);
module.exports = product;

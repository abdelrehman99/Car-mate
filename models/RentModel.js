const mongoose = require('mongoose');
const AppError = require('../utils/apperror');

const required_msg = function(value) {
  return `Please provide a ${value} for your car`;
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

const rentSchema = new mongoose.Schema({
  Name: {
    type: String,
    required: [true, required_msg('Name')],
  },
  RatingsAverage: {
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
  Available: {
    type: Date,
    default: true,
  },
  Owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  Renters: [
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
  createdAt: Date,
});

rentSchema.pre('save', function(next) {
  this.RatingsAverage = this.RatingsSum / this.Ratings.length;
  next();
});

const rent = mongoose.model('rent', rentSchema);
module.exports = rent;
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');
const crypto = require('crypto');

// Schema
const UserSchema = new mongoose.Schema({
  FirstName: {
    type: String,
    required: [true, 'Please provide a first name'],
  },
  LastName: {
    type: String,
    required: [true, 'Please provide a last name'],
  },
  PhoneNumber: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
  },
  Balance: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  ConfirmPassword: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  Owns: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'product',
    },
  ],
  Image: {
    type: String,
    default:
      'https://console.cloudinary.com/console/c-8acfcf0047d9c387c767ec92fb5d50/media-explorer?assetId=bed4c018c59fa28a8322c1b447c03815',
  },
  ownRents: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'rent',
    },
  ],
  Rented: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'rent',
    },
  ],
  Purchased: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'product',
    },
  ],
  Favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'product',
    },
  ],
  PasswordChangedAt: Date,
  PasswordResetToken: String,
  PasswordResetExpiry: Date,
});

UserSchema.plugin(mongooseIntlPhoneNumber, {
  hook: 'validate',
  phoneNumberField: 'PhoneNumber',
  nationalFormatField: 'nationalFormat',
  internationalFormat: 'internationalFormat',
  countryCodeField: 'countryCode',
});

// UserSchema.pre(/^find/, function(next) {
//   this.populate('Owns Purchased');
//   next();
// });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.ConfirmPassword = undefined;

  next();
});

UserSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  // minus 1 sec because creating a token takes time
  this.PasswordChangedAt = Date.now() - 1000;

  next();
});

UserSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  console.log(candidatePassword + '\n' + userPassword);
  console.log(await bcrypt.compare(candidatePassword, userPassword));
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.ChangedPassword = function(JWTstamp) {
  const ChangedPasswordTime = parseInt(this.PasswordChangedAt.getTime());
  JWTstamp *= 1000;

  // false if user did not change password after creating
  return ChangedPasswordTime > JWTstamp;
};

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.PasswordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(this.PasswordResetToken);
  console.log(resetToken);
  // change it to minutes
  this.PasswordResetExpiry = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

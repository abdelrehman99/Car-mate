const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
var mongooseIntlPhoneNumber = require('mongoose-intl-phone-number');

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
  PasswordChangedAt: Date,
});

UserSchema.plugin(mongooseIntlPhoneNumber, {
  hook: 'validate',
  phoneNumberField: 'PhoneNumber',
  nationalFormatField: 'nationalFormat',
  internationalFormat: 'internationalFormat',
  countryCodeField: 'countryCode',
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.ConfirmPassword = undefined;
  next();
});

UserSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  console.log(candidatePassword + '\n' + userPassword);
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.ChangedPassword = function(JWTstamp) {
  const ChangedPasswordTime = parseInt(this.PasswordChangedAt.getTime());
  JWTstamp *= 1000;

  // false if user did not change password after creating
  return ChangedPasswordTime > JWTstamp;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;

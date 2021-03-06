const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  roles: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // This only works on CREATE and SAVE!!!
    validate: {
      validator: function (el) {
        return el.trim() === this.password.trim();
      },
      message: "Passwords don't match",
    },
  },
  passwordChangedAt: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  aactive: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined; // To not persist in db, though it is a required input
  next();
});

userSchema.pre('save', function (next) {
  if (
    !this.isModified('password') ||
    this.isNew //document is new
  )
    return next();

  this.passwordChangedAt = Date.now() - 1000; // 1 sec buffer
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

//Instance method; available with User document; 'this' points to document
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//User changed pwd after token issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  let changedTS;
  if (this.passwordChangedAt) {
    changedTS = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    // console.log(changedTS, JWTTimestamp);
  }
  return JWTTimestamp < changedTS; //false means not changed
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

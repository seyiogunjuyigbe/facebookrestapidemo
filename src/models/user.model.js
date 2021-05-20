const mongoose = require('mongoose');

const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      maxlength: 100,
    },
    password: {
      type: String,
      required: 'Your password is required',
      maxlength: 100,
    },

    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    avatar: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, bufferTimeoutMS: 30000 }
);
// this is to remove the password from the user object when transformed
userSchema.options.toJSON = {
  transform(doc, userObject) {
    delete userObject.password;
    return userObject;
  },
};

// this method is to compare the user's password with a given string value
userSchema.methods.comparePassword = function verifyPassword(password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.pre('save', function preSave(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(error);

      user.password = hash;
      next();
    });
  });
});
module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const { Schema } = mongoose;

const tokenSchema = new Schema(
  {
    token: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresIn: Date,
    type: {
      type: String,
      enum: ['verify-email', 'password-reset'],
      required: true,
    },
    expired: { type: Boolean, default: false },
  },
  { timestamps: true }
);
let Token;
try {
  Token = mongoose.model('Token');
} catch (error) {
  Token = mongoose.model('Token', tokenSchema);
}

module.exports = Token;

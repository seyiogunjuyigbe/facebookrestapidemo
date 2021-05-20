const mongoose = require('mongoose');

const { Schema } = mongoose;
const reactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    referenceType: {
      type: String,
      enum: ['Post', 'Comment'],
    },
    reference: {
      type: Schema.Types.ObjectId,
      refPath: 'referenceType',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reaction', reactionSchema);

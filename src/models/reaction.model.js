const mongoose = require('mongoose');

const { Schema } = mongoose;
const reactionSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'],
    },
    author: {
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
  { timestamps: true, bufferTimeoutMS: 30000 }
);

let Reaction;
try {
  Reaction = mongoose.model('Reaction');
} catch (error) {
  Reaction = mongoose.model('Reaction', reactionSchema);
}

module.exports = Reaction;

const mongoose = require('mongoose');

const { Schema } = mongoose;
const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  },
  { timestamps: true, bufferTimeoutMS: 30000 }
);
module.exports = mongoose.model('Comment', commentSchema);

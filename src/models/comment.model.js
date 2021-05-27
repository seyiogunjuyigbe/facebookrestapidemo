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
// this is to prevent mongoose from attempting to re-model the collection during recursive testing
let Comment;
try {
  Comment = mongoose.model('Comment');
} catch (error) {
  Comment = mongoose.model('Comment', commentSchema);
}

module.exports = Comment;

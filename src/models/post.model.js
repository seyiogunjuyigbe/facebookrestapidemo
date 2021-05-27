const mongoose = require('mongoose');

const { Schema } = mongoose;
const createError = require('http-errors');

const postSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['text', 'media', 'activity'],
      default: 'text',
    },
    text: {
      type: String,
      trim: true,
    },
    media: [String],
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, bufferTimeoutMS: 30000 }
);

// pre-save hook to ensure post has at least some text or media;
postSchema.pre('save', function checkPostFields(next) {
  if (!this.text && !this.media.length) {
    throw createError(400, 'post body can not be empty');
  }
  next();
});

let Post;
try {
  Post = mongoose.model('Post');
} catch (error) {
  Post = mongoose.model('Post', postSchema);
}

module.exports = Post;

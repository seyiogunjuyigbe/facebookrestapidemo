const mongoose = require('mongoose');
const { Schema } = mongoose;
const createError = require('http-errors')
const postSchema = new Schema({
    type: {
        type: String,
        enum: ['text', 'media', 'activity'],
        default: 'text'
    },
    text: {
        type: String,
        trim: true
    },
    media: [String],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


// using the require statements here to avoid circular dependecy errors
const Reaction = require('./reaction.model');
const Comment = require('./comment.model');
// ensure post is not empty;
postSchema.pre('save', function checkPostFields(next) {
    if (!this.text && !this.media.length) {
        throw createError(400, "post body can not be empty")
    }
    next()
})
// delete all reactions and comments related to a post once it is deleted
postSchema.post('deleteOne', async (next) => {
    try {
        await Reaction.deleteMany({ reference: this._id });
        await Comment.deleteMany({ post: this._id });
        next()
    }
    catch (err) {
        throw err.message
    }
});

module.exports = mongoose.model('Post', postSchema)
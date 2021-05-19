const mongoose = require('mongoose');
const { Schema } = mongoose;
const commentSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    }
}, { timestamps: true });
commentSchema.post('deleteOne', async (next) => {
    try {
        await Reaction.deleteMany({ reference: this._id });
        next()
    }
    catch (err) {
        throw err.message
    }
})
module.exports = mongoose.model("Comment", commentSchema)
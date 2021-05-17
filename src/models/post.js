const mongoose = require('mongoose');
const { Schema } = mongoose;
const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['text', 'media', 'activity']
    },
    text: {
        type: String
    },
    media: [String],
    reactions: [],
    comments: [],
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    views: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
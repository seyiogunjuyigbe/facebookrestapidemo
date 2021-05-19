const { Post, Comment } = require('../models');
const { find, findOne } = require('../services/queryService')
const { response } = require('../middlewares');

exports.createComment = async (req, res, next) => {
    try {
        let post = await Post.findById(req.body.postId);
        if (!post) {
            return response(res, 404, 'post not found')
        }
        let comment = await Comment.create({ ...req.body, post, author: req.user.id, });
        return response(res, 200, "comment created successfully", comment)
    } catch (error) {
        next(error)
    }
};
exports.fetchComments = async (req, res, next) => {
    try {
        let comments = await find(Comment, req);
        return response(res, 200, "comments fetched successfully", comments)
    } catch (error) {
        next(error)
    }
}
exports.fetchSingleComment = async (req, res, next) => {
    try {
        let comment = await findOne(Comment, req);
        return response(res, comment ? 200 : 404, comment ? "comments fetched successfully" : "comment not found", comment)

    } catch (error) {
        next(error)
    }
}

exports.updateComment = async (req, res, next) => {
    try {
        let comment = await Comment.updateOne({ _id: req.params.commentId }, { ...req.body });
        if (!comment) {
            return response(res, 404, "comment not found")
        }
        let updatedComment = await Comment.findById(comment._id)
        return response(res, 200, "comment updated successfully", updatedComment)
    } catch (error) {
        next(error)
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        let deletedComment = await Comment.deleteOne({ _id: req.params.commentId });
        if (!deletedComment) {
            return response(res, 404, 'comment not found');
        }
        return response(res, 200, 'comment deleted successfully')
    } catch (error) {
        next(error)
    }
}

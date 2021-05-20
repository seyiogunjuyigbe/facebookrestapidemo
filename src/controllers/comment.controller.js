const { Post, Comment, Reaction } = require('../models');
const { find, findOne } = require('../services/query.service');
const { response } = require('../middlewares');

exports.createComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.body.postId);
    if (!post) {
      return response(res, 404, 'post not found');
    }
    const comment = await Comment.create({
      ...req.body,
      post,
      author: req.user.id,
    });
    post.comments.addToSet(comment._id);
    await post.save();
    return response(res, 200, 'comment created successfully', comment);
  } catch (error) {
    next(error);
  }
};
exports.fetchComments = async (req, res, next) => {
  try {
    const comments = await find(Comment, req);
    return response(res, 200, 'comments fetched successfully', comments);
  } catch (error) {
    next(error);
  }
};
exports.fetchSingleComment = async (req, res, next) => {
  try {
    const comment = await findOne(Comment, req);
    return response(
      res,
      comment ? 200 : 404,
      comment ? 'comments fetched successfully' : 'comment not found',
      comment
    );
  } catch (error) {
    next(error);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const comment = await Comment.updateOne(
      { _id: req.params.commentId },
      { ...req.body }
    );
    if (!comment) {
      return response(res, 404, 'comment not found');
    }
    const updatedComment = await Comment.findById(req.params.commentId);
    return response(res, 200, 'comment updated successfully', updatedComment);
  } catch (error) {
    next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId).populate(
      'post'
    );
    if (!comment) {
      return response(res, 404, 'comment not found');
    }
    const { post } = comment;
    // delete all reactions related to this comment
    await Reaction.deleteMany({ reference: comment._id });
    if (post) {
      // remove this comment from parent post
      post.comments.pull(comment._id);
      await post.save();
    }
    // delete comment
    await Comment.deleteOne({
      _id: comment._id,
    });
    return response(res, 200, 'comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

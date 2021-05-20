const { Post, Reaction, Comment } = require('../models');
const { find, findOne } = require('../services/query.service');
const { response } = require('../middlewares');

exports.createPost = async (req, res, next) => {
  try {
    const media = req.files ? req.files.map((file) => file.path) : [];
    const post = await Post.create({ ...req.body, media, author: req.user.id });
    return response(res, 200, 'post created successfully', post);
  } catch (error) {
    next(error);
  }
};
exports.fetchPosts = async (req, res, next) => {
  try {
    const posts = await find(Post, req);
    return response(res, 200, 'posts fetched successfully', posts);
  } catch (error) {
    next(error);
  }
};
exports.fetchSinglePost = async (req, res, next) => {
  try {
    const post = await findOne(Post, req);
    if (post) {
      post.views += 1;
      await post.save();
    }
    return response(
      res,
      post ? 200 : 404,
      post ? 'post fetched successfully' : 'post not found',
      post
    );
  } catch (error) {
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const media = req.files ? req.files.map((file) => file.path) : [];
    const post = await Post.findByIdAndUpdate(req.params.postId, {
      ...req.body,
    });
    if (!post) {
      return response(res, 404, 'post not found');
    }
    if (media.length) {
      post.media.push(...media);
    }
    await post.save();
    const updatedPost = await Post.findById(post._id);
    return response(res, 200, 'post updated successfully', updatedPost);
  } catch (error) {
    next(error);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return response(res, 404, 'post not found');
    }
    // delete all reactions and comments related to a post once it is deleted
    await Reaction.deleteMany({ reference: post._id });
    await Comment.deleteMany({ post: post._id });
    // delete post
    await Post.deleteOne({ _id: post._id });
    return response(res, 200, 'post deleted successfully');
  } catch (error) {
    next(error);
  }
};

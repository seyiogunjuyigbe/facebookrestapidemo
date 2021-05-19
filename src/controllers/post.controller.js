const { Post, Comment, Reaction } = require('../models');
const { find, findOne } = require('../services/queryService')
const { response } = require('../middlewares');

exports.createPost = async (req, res, next) => {
    try {
        let media = req.files ? req.files.map(file => {
            return file.path
        }) : [];
        let post = await Post.create({ ...req.body, media, author: req.user.id, });
        return response(res, 200, "post created successfully", post)
    } catch (error) {
        next(error)
    }
};
exports.fetchPosts = async (req, res, next) => {
    try {
        let posts = await find(Post, req);
        return response(res, 200, "posts fetched successfully", posts)
    } catch (error) {
        next(error)
    }
}
exports.fetchSinglePost = async (req, res, next) => {
    try {
        let post = await findOne(Post, req);
        if (post) {
            post.views += 1;
            await post.save()
        }
        return response(res, post ? 200 : 404, post ? "post fetched successfully" : "post not found", post)

    } catch (error) {
        next(error)
    }
}

exports.updatePost = async (req, res, next) => {
    try {
        let media = req.files ? req.files.map(file => {
            return file.path
        }) : [];
        let post = await Post.findByIdAndUpdate(req.params.postId, { ...req.body });
        if (!post) {
            return response(res, 404, "post not found")
        }
        if (media.length) {
            post.media.push(...media)
        }
        await post.save();
        let updatedPost = await Post.findById(post._id)
        return response(res, 200, "post updated successfully", updatedPost)
    } catch (error) {
        next(error)
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        let deletedPost = await Post.deleteOne({ _id: req.params.postId });
        if (!deletedPost) {
            return response(res, 404, 'post not found');
        }
        return response(res, 200, 'post deleted successfully')
    } catch (error) {
        next(error)
    }
}

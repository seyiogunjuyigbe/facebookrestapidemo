const Models = require('../models');
const { find, findOne } = require('../services/queryService')
const { response } = require('../middlewares');

exports.createReaction = async (req, res, next) => {
    try {
        let reference = await Models[req.body.referenceType].findById(req.body.referenceId);
        if (!post) {
            return response(res, 404, 'post not found')
        }
        let reaction = await Reaction.create({ ...req.body, reference, author: req.user.id, });
        return response(res, 200, "reaction created successfully", reaction)
    } catch (error) {
        next(error)
    }
};
exports.fetchReactions = async (req, res, next) => {
    try {
        let reactions = await find(Reaction, req);
        return response(res, 200, "reactions fetched successfully", reactions)
    } catch (error) {
        next(error)
    }
}
exports.fetchSingleReaction = async (req, res, next) => {
    try {
        let reaction = await findOne(Reaction, req);
        return response(res, reaction ? 200 : 404, reaction ? "reactions fetched successfully" : "reaction not found", reaction)

    } catch (error) {
        next(error)
    }
}

exports.updateReaction = async (req, res, next) => {
    try {
        let reaction = await Reaction.updateOne({ _id: req.params.reactionId }, { ...req.body });
        if (!reaction) {
            return response(res, 404, "reaction not found")
        }
        let updatedReaction = await Reaction.findById(reaction._id)
        return response(res, 200, "reaction updated successfully", updatedReaction)
    } catch (error) {
        next(error)
    }
}

exports.deleteReaction = async (req, res, next) => {
    try {
        let deletedReaction = await Reaction.deleteOne({ _id: req.params.reactionId });
        if (!deletedReaction) {
            return response(res, 404, 'reaction not found');
        }
        return response(res, 200, 'reaction deleted successfully')
    } catch (error) {
        next(error)
    }
}

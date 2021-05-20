const Models = require('../models');

const { Reaction } = Models;
const { find, findOne } = require('../services/query.service');
const { response } = require('../middlewares');

exports.createReaction = async (req, res, next) => {
  try {
    const reference = await Models[req.body.referenceType].findById(
      req.body.referenceId
    );
    if (!reference) {
      return response(res, 404, 'reference not found');
    }
    const reaction = await Reaction.create({
      ...req.body,
      reference,
      author: req.user.id,
    });
    reference.reactions.addToSet(reaction._id);
    await reference.save();
    return response(res, 200, 'reaction created successfully', reaction);
  } catch (error) {
    next(error);
  }
};
exports.fetchReactions = async (req, res, next) => {
  try {
    const reactions = await find(Reaction, req);
    return response(res, 200, 'reactions fetched successfully', reactions);
  } catch (error) {
    next(error);
  }
};
exports.fetchSingleReaction = async (req, res, next) => {
  try {
    const reaction = await findOne(Reaction, req);
    return response(
      res,
      reaction ? 200 : 404,
      reaction ? 'reactions fetched successfully' : 'reaction not found',
      reaction
    );
  } catch (error) {
    next(error);
  }
};

exports.updateReaction = async (req, res, next) => {
  try {
    const reaction = await Reaction.updateOne(
      { _id: req.params.reactionId },
      { ...req.body }
    );
    if (!reaction) {
      return response(res, 404, 'reaction not found');
    }
    const updatedReaction = await Reaction.findById(req.params.reactionId);
    return response(res, 200, 'reaction updated successfully', updatedReaction);
  } catch (error) {
    next(error);
  }
};

exports.deleteReaction = async (req, res, next) => {
  try {
    const reaction = await Models.Reaction.findById(
      req.params.reactionId
    ).populate('reference');
    if (!reaction) {
      return response(res, 404, 'reaction not found');
    }
    const { reference } = reaction;
    if (reference) {
      // remove reaction from parent document
      reference.reactions.pull(reaction._id);
      await reference.save();
    }
    await Reaction.deleteOne({
      _id: reaction._id,
    });
    return response(res, 200, 'reaction deleted successfully');
  } catch (error) {
    next(error);
  }
};

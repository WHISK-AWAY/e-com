import express from 'express';
const router = express.Router({ mergeParams: true });
import { Product, Review, UserVote } from '../database/index';
import { z } from 'zod';
import mongoose from 'mongoose';
import { checkAuthenticated, sameUserOrAdmin } from './authMiddleware';
import { zodReview } from '../../utils';

const zodCreateReview = zodReview.strict();
const zodUpdateReview = zodReview
  .strict()
  .deepPartial()
  .refine(
    (data) => {
      return (
        data.title !== undefined ||
        data.content !== undefined ||
        data.rating !== undefined ||
        data.nickname !== undefined ||
        data.location !== undefined
      );
    },
    { message: 'Update at least one of the fields' }
  );

type TZodReview = z.infer<typeof zodReview>;

const zodProductId = z.string().refine(
  (productId) => {
    return mongoose.Types.ObjectId.isValid(productId);
  },
  { message: 'Invalid productID' }
);

const zodReviewId = z.string().refine(
  (reviewId) => {
    return mongoose.Types.ObjectId.isValid(reviewId);
  },
  {
    message: 'Invalid reviewID',
  }
);

router.get('/', async (req, res, next) => {
  try {
    const { productId } = req.params as { productId: string };
    const validProductId = zodProductId.parse(productId);

    const allReviews = await Review.find({ product: productId }).populate({
      path: 'product',
      populate: 'tags',
    });
    if (!allReviews)
      return res.status(404).send('No reviews available for this product');

    res.status(200).json(allReviews);
  } catch (err) {
    next(err);
  }
});

router.post('/', checkAuthenticated, async (req, res, next) => {
  try {
    const parsedBody: TZodReview & { product?: string; user?: string } =
      zodCreateReview.parse(req.body);

    const { productId } = req.params;
    const validProductId = zodProductId.parse(productId);
    const product = await Product.findById(validProductId);
    parsedBody.product = productId;
    parsedBody.user = req.userId;
    if (!product)
      return res
        .status(404)
        .send('Product you are searching for does not exist');

    const checkExistingReview = await Review.find({
      product: validProductId,
      user: req.userId,
    });

    if (checkExistingReview.length >= 1)
      return res.status(409).send('Cannot create duplicate review');

    const newReview = await (
      await Review.create(parsedBody)
    ).populate(['user', 'product']);

    res.status(201).json(newReview);
  } catch (err) {
    next(err);
  }
});

/**
 * * UPVOTE
 */
router.post('/:reviewId/upvote', checkAuthenticated, async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const validReviewId = zodReviewId.parse(reviewId);
    const { productId } = req.params;
    const validProductId = zodProductId.parse(productId);
    const userId = req.userId;
    
    const userUpvote = await UserVote.find({ userId, reviewId });
    if (userUpvote.length >= 1 && userUpvote[0].userVoteChoice === 'upvote') {

      return res
        .status(409)
        .send('Cannot upvote review: user has already voted');
    } else {
      if(userUpvote.length >=1 && userUpvote[0].userVoteChoice !== 'upvote') 
      await userUpvote[0].update({userVoteChoice: 'upvote'})
    }

    const userVoteRecord = await UserVote.create({ userId, reviewId });
    const upvoteReview = await Review.findOneAndUpdate(
      { _id: reviewId },
      { $inc: { upvote: 1 } },
      { new: true }
    );

    res.status(201).json(upvoteReview);
  } catch (err) {
    next(err);
  }
});

/**
 * * DOWNVOTE
 */
router.post('/:reviewId/downvote', checkAuthenticated, async(req, res ,next) => {
  try{
    const {reviewId} = req.params;
    const validReviewId = zodReviewId.parse(reviewId);
    const {productId} = req.params;
    const validProductId = zodProductId.parse(productId);
    const userId = req.userId;

    const userDownvote = await UserVote.find({userId, reviewId});
    if(userDownvote.length >=1 && userDownvote[0].userVoteChoice === 'downvote') return res.status(409).send('Cannot downvote review: user already downvoted this review');

    const userVoteRecord = await UserVote.create({userId, reviewId});

    const downvoteReview = await Review.findOneAndUpdate({_id: reviewId}, {$inc: {downvote: 1}}, {new: true});

    res.status(201).json(downvoteReview);
  }catch(err) {
    next(err);
  }
});

router.put('/:reviewId', checkAuthenticated, async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { productId } = req.params;
    const validReviewId = zodReviewId.parse(reviewId);
    const validProductId = zodProductId.parse(productId);
    const userId = req.userId;

    const parsedBody = zodUpdateReview.parse(req.body);
    const existingReview = await Review.findById(validReviewId);

    if (!existingReview)
      return res
        .status(404)
        .send('Review you are trying to update does not exist');
    if (
      String(existingReview.product) !== validProductId ||
      existingReview.user !== userId
    )
      return res.status(400).send('Cannot update review: invalid credentials ');

    if (parsedBody.rating) {
      if (!parsedBody.rating.overall)
        parsedBody.rating.overall = existingReview.rating.overall;
      if (!parsedBody.rating.quality)
        parsedBody.rating.quality = existingReview.rating.quality;
      if (!parsedBody.rating.value)
        parsedBody.rating.value = existingReview.rating.value;
    }

    const updateReview = await Review.updateOne(
      { _id: validReviewId },
      parsedBody
    );

    res.status(200).json(updateReview);
  } catch (err) {
    next(err);
  }
});

router.delete('/:reviewId', checkAuthenticated, async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.userId;
    const validReviewId = zodReviewId.parse(reviewId);
    const existingReview = await Review.findById(validReviewId);
    const { productId } = req.params;

    if (!existingReview)
      return res
        .status(404)
        .send('Cannot delete review: it does not exist in the database');

    if (
      existingReview.user !== userId ||
      String(existingReview.product) !== productId
    )
      return res
        .status(403)
        .send(
          'Cannot delete review: provided userID or productID does not match'
        );

    await Review.softDelete({ _id: validReviewId });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;

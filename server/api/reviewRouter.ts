import express from 'express';
const router = express.Router({ mergeParams: true });
import { Product, Review } from '../database/index';

router.get('/', async (req, res, next) => {
  try {
    const { productId } = req.params as {productId:string};
    // console.log('prodDI', productId);
    // console.log('params', req.params);
    // if(!productId) return res.status()

    const allReviews = await Review.find({product: productId}).populate({path: 'product', populate: 'tags'});
    if (!allReviews)
      return res.status(404).send('No reviews available for this product');

    res.status(200).json(allReviews);
  } catch (err) {
    next(err);
  }
});

export default router;

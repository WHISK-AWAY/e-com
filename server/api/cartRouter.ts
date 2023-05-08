import express from 'express';
const router = express.Router({ mergeParams: true });
import { User } from '../database/index';
import { checkAuthenticated, sameUserOrAdmin } from './authMiddleware';

router.get('/', checkAuthenticated, sameUserOrAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    // console.log('ID', userId);
    const user = await User.findById(userId, 'cart').populate({path: 'cart.products.product', populate: {path: 
    'tags'}})
      if(user === null) return res.status(404).send('User does not exist');

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});




export default router;

import express from 'express';
const router = express.Router({ mergeParams: true });
import { User, Product } from '../database/index';
import { checkAuthenticated, sameUserOrAdmin } from './authMiddleware';
import { z } from 'zod';

const zodProduct = z
  .object({
    productId: z.string().min(10),
    qty: z.number().min(1),
  })
  .strict();

router.get('/', checkAuthenticated, sameUserOrAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    // console.log('ID', userId);
    const user = await User.findById(userId, 'cart').populate({
      path: 'cart.products.product',
      populate: { path: 'tags' },
    });
    if (user === null) return res.status(404).send('User does not exist');

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/addItem',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).send('User does not exist');
      const { productId, qty } = zodProduct.parse(req.body);

      const addItem = await user.cart.addProduct!(productId, qty);
      if (!addItem)
        res
          .status(409)
          .json({ message: 'Not enough inventory - nothing added to cart' });

      res.status(201).json(addItem);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/removeItem',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) return res.status(404).send('User does not exist');

      const { productId, qty } = zodProduct.parse(req.body);

      const removeItem = await user.cart.removeProduct!!!(productId, qty);

      const minQtyCheck = await User.findById(userId);
      const insufficientQty = minQtyCheck?.cart.products.filter(
        (qty) => qty.qty < 1
      );

      console.log('IQ', insufficientQty);
      if (insufficientQty?.length! > 0)
        return res.status(500).send('Insuffient quantity');

      res.status(204).json(removeItem);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/clearCart',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);

      if (!user) return res.status(404).send('User does not exist');
      const clearCart = await user.cart.clearCart!({ restock: true });
      res.status(204).json(clearCart);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

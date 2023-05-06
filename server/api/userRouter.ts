import express from 'express';
const router = express.Router();
import { User, mongooseConnection } from '../database/index';
// import { requiresAuth, claimCheck } from 'express-openid-connect';
// import { nextTick } from 'process';
// import { jwtCheck, requiresAdmin } from './authMiddleware';
import {
  checkAuthenticated,
  requireAdmin,
  sameUserOrAdmin,
} from './authMiddleware';
import { z, ZodError } from 'zod';

const zodUserId = z.string();

router.get('/', checkAuthenticated, requireAdmin, async (req, res, next) => {
  try {
    const allUsers = await User.find({}, '-password');
    if (!allUsers || allUsers.length === 0)
      return res.status(404).send('Users do not exist');

    res.status(200).json(allUsers);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:userId',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const parsedBody = zodUserId.parse(userId);

      const user = await User.findById(userId, '-password')
        .populate({ path: 'cart.products.product', populate: { path: 'tags' } })
        .populate({ path: 'favorites', populate: { path: 'tags' } });

      if (!user)
        return res.status(404).send('User with the given ID do not exist');

      res.status(200).json(user);
    } catch (err) {
      if (err instanceof ZodError)
        return res.status(400).send('Invalid user ID');
      next(err);
    }
  }
);

export default router;

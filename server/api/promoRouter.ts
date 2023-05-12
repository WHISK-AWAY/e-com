import express from 'express';
import { checkAuthenticated, requireAdmin } from './authMiddleware';
import { Promo } from '../database/index';
const router = express.Router();

router.get('/', checkAuthenticated, requireAdmin, async (req, res, next) => {
  try {
    const promos = await Promo.find();
    if (!promos.length)
      return res.status(404).json({ message: 'No promo codes found...' });

    res.status(200).json(promos);
  } catch (err) {
    next(err);
  }
});

export default router;

import express from 'express';
import { checkAuthenticated, requireAdmin } from './authMiddleware';
import { Promo } from '../database/index';
import { MAX_PROMO_RATE } from '../database/Promo';
import { z } from 'zod';
import mongoose from 'mongoose';
const router = express.Router();

// list all promo codes
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

const zodPromo = z.object({
  promoCodeName: z.string().min(2),
  promoRate: z.number().min(0.01).max(MAX_PROMO_RATE),
});

const zodCreatePromo = zodPromo.strict();
const zodUpdatePromo = zodPromo
  .partial()
  .strict()
  .refine(
    ({ promoCodeName, promoRate }) => {
      return promoCodeName !== undefined || promoRate !== undefined;
    },
    { message: 'Must provide either promo name or promo rate' }
  );

// create promo code
router.post('/', checkAuthenticated, requireAdmin, async (req, res, next) => {
  try {
    const newPromoInput = zodCreatePromo.parse(req.body);

    const existingPromo = await Promo.findOne({
      promoCodeName: newPromoInput.promoCodeName,
    });

    if (existingPromo)
      return res
        .status(409)
        .json({ message: 'Cannot create: Promo code already exists' });

    const newPromo = await Promo.create(newPromoInput);

    res.status(201).json(newPromo);
  } catch (err) {
    next(err);
  }
});

const zodPromoId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id));

// update promo code
router.put(
  '/:promoId',
  checkAuthenticated,
  requireAdmin,
  async (req, res, next) => {
    try {
      const promoId = zodPromoId.parse(req.params.promoId);
      const promoInput = zodUpdatePromo.parse(req.body);

      const updatedPromo = await Promo.findByIdAndUpdate(promoId, promoInput, {
        new: true,
      });

      if (!updatedPromo)
        return res.status(404).json({ message: 'Promo ID not found' });

      res.status(200).json(updatedPromo);
    } catch (err) {
      next(err);
    }
  }
);

// delete promo code
router.delete(
  '/:promoId',
  checkAuthenticated,
  requireAdmin,
  async (req, res, next) => {
    try {
      const promoId = zodPromoId.parse(req.params.promoId);
      const deleteCheck = await Promo.findByIdAndDelete(promoId);
      if (!deleteCheck)
        return res
          .status(404)
          .json({ message: 'Cannot delete: Promo ID not found' });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

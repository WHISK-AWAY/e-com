import express from 'express';
const router = express.Router();
import { Order } from '../database/index';
import {
  checkAuthenticated,
  requireAdmin,
  sameUserOrAdmin,
} from './authMiddleware';

router.get('/', checkAuthenticated, requireAdmin, async (req, res, next) => {
  try {
    const allOrders = await Order.find();

    if (!allOrders || !allOrders.length)
      return res.status(404).send('No orders available to view');

    res.status(200).json(allOrders);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:orderId',
  checkAuthenticated,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { orderId } = req.params;
      const order = await Order.findById(orderId);

      if (!order)
        return res.status(404).send('Order with given ID does not exist');

      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  }
);



export default router;

import express from 'express';
import mongoose from 'mongoose';
import { checkAuthenticated, sameUserOrAdmin } from './authMiddleware';
const router = express.Router({ mergeParams: true });
import { z } from 'zod';
import validator from 'validator';
import { User, Order, Promo, Product } from '../database/index';
import { zodOrder, zodUserId, zodOrderId } from '../../utils';
import { TProduct } from '../database/dbTypes';

const zodCreateOrder = zodOrder
  .strict()
  .refine(
    (data) => {
      return (
        data.user.shippingInfo.firstName !== undefined ||
        data.user.shippingInfo.lastName !== undefined ||
        data.user.shippingInfo.email !== undefined ||
        data.user.shippingInfo.address_1 !== undefined ||
        data.user.shippingInfo.address_2 !== undefined ||
        data.user.shippingInfo.city !== undefined ||
        data.user.shippingInfo.state !== undefined ||
        data.user.shippingInfo.zip !== undefined ||
        data.promoCode?.promoCodeName !== undefined
      );
    },
    {
      message: 'All not optional fields are required',
    }
  )
  .refine(
    (cc) => {
      console.log('CC validator', cc.user.paymentInfo.cardNum);
      return validator.isCreditCard(cc.user.paymentInfo.cardNum);
    },
    {
      message: 'CreditCard validation failed',
    }
  );

// ensure correct shape of user input
type TzodOrderInput = z.infer<typeof zodOrder>;

// ensure correct shape for Order.create() query
// since promoCode exists already, have to re-write it in the way Order expects
type TOrderQuery = Omit<TzodOrderInput, 'promoCode'> & {
  orderDetails: {
    productId: mongoose.Types.ObjectId;
    productName: string;
    productDesc: string;
    brand: string;
    imageURL: string;
    price: number;
    qty: number;
  }[];
  promoCode?: {
    promoCodeName: string;
    promoCodeRate: number;
  };
};

// have to convince TS of the shape of a "populated" user cart
type TExpandedCartProduct = {
  product: {
    _id: mongoose.Types.ObjectId;
    productName: string;
    productDesc: string;
    brand: string;
    imageURL: string;
    price: number;
    qty: number;
    tags: mongoose.Types.ObjectId[];
    __v: number;
  };
  price: number;
  qty: number;
  _id: mongoose.Types.ObjectId;
};

// retrieve all orders for logged-in user
router.get('/', checkAuthenticated, sameUserOrAdmin, async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const userOrders = await Order.find({ 'user.userId': userId });
    if (!userOrders.length)
      return res.status(404).json({ message: 'No orders found for this user' });

    res.status(200).json(userOrders);
  } catch (err) {
    next(err);
  }
});

// retrieve order by ID
router.get(
  '/:orderId',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const validOrderId = zodOrderId.parse(req.params.orderId);
      const { userId } = req.params;
      const order = await Order.findById(validOrderId);

      if (!order)
        return res.status(404).send('Order with given ID does not exist');

      if (userId !== order.user.userId)
        return res
          .status(401)
          .send(
            'Provided userID does not match database record on given orderID'
          );

      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  }
);

// create new order
router.post(
  '/',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const parsedBody = zodOrder.parse(req.body) as TzodOrderInput;

      // find user & read cart info
      const user = await User.findById(userId).populate(
        'cart.products.product'
      );
      if (!user) return res.status(404).json({ message: 'User not found' });

      // re-cast user cart: TS doesn't know the shape of a "populated" cart
      const userCart = user.cart.products as unknown as TExpandedCartProduct[];
      if (!userCart.length)
        return res.status(409).json({ message: "User's cart is empty" });

      // build up object for new order creation
      const newOrderInput: TOrderQuery = {
        orderDetails: userCart.map((prod) => {
          return {
            productId: prod.product._id,
            brand: prod.product.brand,
            imageURL: prod.product.imageURL,
            price: prod.price,
            productDesc: prod.product.productDesc,
            productName: prod.product.productName,
            qty: prod.qty,
          };
        }),
        user: {
          userId,
          shippingInfo: parsedBody.user.shippingInfo,
          paymentInfo: parsedBody.user.paymentInfo,
        },
      };

      // if the user provided a promo code, verify it & add to new order object
      const userPromoCode = parsedBody.promoCode;

      if (userPromoCode) {
        const promoLookup = await Promo.findOne({
          promoCodeName: userPromoCode.promoCodeName,
        });

        if (promoLookup) {
          newOrderInput.promoCode = {
            promoCodeName: promoLookup.promoCodeName,
            promoCodeRate: promoLookup.promoCodeRate,
          };
        }
      }

      // create new order
      const newOrder = await Order.create(newOrderInput);

      // purge user cart if order creation was successful
      if (newOrder) {
        user.cart.clearCart!({ restock: false });
      }

      res.status(201).json(newOrder);
    } catch (err) {
      next(err);
    }
  }
);

export default router;

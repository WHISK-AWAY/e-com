import express from 'express';
import mongoose from 'mongoose';
import { checkAuthenticated, sameUserOrAdmin } from './authMiddleware';
const router = express.Router({ mergeParams: true });
import { z } from 'zod';
import validator from 'validator';
import { User, Order, Promo, Product } from '../database/index';
import { zodOrder } from '../../utils';

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

const zodOrderId = z.string().refine(
  (orderId) => {
    return mongoose.Types.ObjectId.isValid(orderId);
  },
  {
    message: 'Invalid orderID',
  }
);

type TzodOrder = z.infer<typeof zodOrder> & {
  promoCode?: { promoCodeRate: number };
  orderDetails?: {
    productName: string;
    productDesc: string;
    brand: string;
    price: number;
    imageURL: string;
  }[];
};

router.get(
  '/:orderId',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const validOrderId = zodOrderId.parse(req.params.orderId);
      const { userId } = req.params;
      const order = await Order.findById(validOrderId);

      console.log('UID', userId);
      console.log('OUID', order.user.userId);
      if (userId !== order.user.userId)
        return res
          .status(401)
          .send(
            'Provided userID does not match database record on given orderID'
          );
      if (!order)
        return res.status(404).send('Order with given ID does not exist');

      res.status(200).json(order);
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  checkAuthenticated,
  sameUserOrAdmin,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      const parsedBody = zodOrder.parse(req.body) as TzodOrder;
      const userPromoCode = parsedBody.promoCode;

      const orderProducts = parsedBody.orderDetails.map(
        (order) => order.productId
      );

      const productLookup = await Product.find({ _id: orderProducts });

      for (let field of parsedBody.orderDetails) {
        const currentProduct = productLookup.find(
          (prod: any) => field.productId === prod.id.toString()
        );
        field.productName = currentProduct.productName;
        field.productDesc = currentProduct.productDesc;
        field.brand = currentProduct.brand;
        field.imageURL = currentProduct.imageURL;
        field.price = currentProduct.price;
      }


      if (userPromoCode) {
        const promoLookup = await Promo.findOne({
          promoCodeName: userPromoCode.promoCodeName,
        });

        if (promoLookup) {
          userPromoCode.promoCodeName = promoLookup.promoCodeName;
          parsedBody.promoCode!.promoCodeRate = promoLookup.promoRate;
        } else {
          delete parsedBody.promoCode;
        }
      }

      const newOrder = await Order.create(parsedBody);

      console.log('NO', newOrder);
      res.status(204).json(newOrder);
    } catch (err) {
      next(err);
    }
  }
);
export default router;

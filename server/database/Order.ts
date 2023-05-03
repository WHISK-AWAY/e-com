import mongoose, { Schema, Types, model } from 'mongoose';

export interface Order {
  _id?: Types.ObjectId;
  orderDetails: {
    productName: string;
    productDesc: string;
    brand: string;
    imageURL: string;
    price: number;
    qty: number;
  };

  user: {
    _id?: Types.ObjectId;
    shippingInfo: {
      firstName: string;
      lastName: string;
      email: string;
      address_1: string;
      address_2?: string;
      city: string;
      state: string;
      zip: string;
    };
    paymentInfo: {
      paymentType: string;
      // cardType: string,
      cardNum: string;
      exp: Date;
      cvv: string;
    };
  };
  promoCode?: string;
  orderStatus: 'confirmed' | 'pending' | 'canceled';
  date: Date;
}

const orderSchema = new Schema<Order>({
  orderDetails: {
    productName: { type: String, required: true },
    productDesc: { type: String, required: true },
    brand: { type: String, required: true },
    imageURL: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
  },
  user: {
    shippingInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      address_1: { type: String, required: true },
      address_2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
    },
    paymentInfo: {
      paymentType: { type: String, required: true },
      // cardType: {type: String, requred: true},
      cardNum: { type: String, required: true },
      exp: { type: Date, required: true },
      cvv: String,
    },
  },
  promoCode: String,
  date: { type: Date, default: Date.now },
  orderStatus: { type: String, requires: true },
});

export default mongoose.model('Order', orderSchema);

// order {
//  orderDetails [{id,
//   "lotion",
//   "its a lotion",
//   "tippytoe",
//   7,
//   39.99,
//   'imgURLnfjusdfnjksdfnjks',
//  }],

//   'wholesale20',

//  user {
//    _id,
//   shipping{
//     address,
//     name etc
//   },
//   payment{
//     paymentinfo...
//   },
//   'comfirmed',
//   '05/18/23',

// }
// }

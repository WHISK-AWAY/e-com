import mongoose, { Schema, Types } from 'mongoose';
import Product, { IProduct } from './Product';
import { urlToHttpOptions } from 'url';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env ' });
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;

type TProduct = {
  product: Types.ObjectId;
  price: number;
  qty: number;
};

export interface ICart {
  products?: TProduct[];
  subtotal?(): number;
  addProduct?(productId: mongoose.Types.ObjectId, qty: number): void;
}

const cartSchema = new Schema<ICart>(
  {
    products: [
      {
        product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' },
        price: Number,
        qty: Number,
      },
    ],
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// TODO: remove product
// TODO: clear cart

cartSchema.methods.addProduct = async function (
  productId: Types.ObjectId,
  qty: number
): Promise<void> {
  // look up the product by id
  // compare add qty to qty available on product doc
  // if we're trying to add too many --- add only as many as we have, and notify (?)
  if (!qty || qty < 1) return;

  const prod = await Product.findById(productId);
  if (!prod) return;

  if (!this.products || this.products.length === 0) {
    // if cart has no products, initialize it as an empty array so we're safe to push into it later
    this.products = [];
  }

  const addToCart = {
    product: prod.id,
    price: prod.price,
    qty: Math.min(prod.qty, qty), // lesser of requested & available
  };

  const existingProducts: Types.ObjectId[] = this.products.map(
    (prod: TProduct) => prod.product.toString()
  );

  if (existingProducts.includes(productId)) {
    // cart already includes product
    for (let prod of this.products) {
      if (prod.product.toString() === productId) {
        prod.qty += addToCart.qty;
        break;
      }
    }
  } else {
    // cart doesn't already include product
    this.products.push(addToCart);
  }

  await prod.updateOne({ $inc: { qty: -addToCart.qty } }).exec();

  return;
};

cartSchema.virtual('subtotal').get(function (this: ICart) {
  let tot = 0;

  if (!this.products) return tot;

  for (let prod of this.products) {
    tot += prod.price * prod.qty;
  }

  return tot;
});

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: {
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    zip: string;
  };
  favorites?: Types.ObjectId[];
  cart: ICart;
  role: 'admin' | 'user' | 'guest';
  reviewCount?: number;
  voteCount?: number;
  skinConcerns?: string[];
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true, minLength: 2 },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minLength: 8 },
  address: {
    address_1: { type: String, required: true },
    address_2: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: { type: String, required: true },
  },
  favorites: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Product',
    },
  ],
  cart: cartSchema,
  role: {
    type: String,
    enum: ['admin', 'user', 'guest'],
    required: true,
    default: 'user',
  },
  reviewCount: Number,
  voteCount: Number,
  skinConcerns: [String],
});

userSchema.pre('validate', async function (next) {
    // if(this.password.length > 20 || this.password.length < 8) throw new Error('Do not meet max password length requirement')
    this.password = await bcrypt.hash(this.password, +SALT_ROUNDS!);
  
});

export default mongoose.model('User', userSchema);

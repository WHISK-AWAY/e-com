import mongoose, { Schema, StringExpression, Types } from 'mongoose';
import Product from './Product';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
dotenv.config({ path: '../../.env ' });
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ICart, TProduct, TCartReturn, IUser } from './dbTypes';
import {
  addToCart,
  cartSubtotal,
  clearCart,
  hashPassword,
  hashUpdatedPassword,
  removeFromCart,
} from './cartMethods';

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
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, default: uuid },
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
    cart: {
      type: cartSchema,
      default: {},
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guest'],
      required: true,
      default: 'user',
    },
    reviewCount: { type: Number, default: 0 },
    voteCount: { type: Number, default: 0 },
    skinConcerns: [String],
  },
  {
    statics: {
      async purgeInactiveCart() {
        const msPerDay = 1000 * 60 * 60 * 24;
        const purgeDay = new Date(Date.now() - msPerDay * 2);

        const allUserCart = await this.find({
          'cart.updatedAt': { $lte: purgeDay },
        });

        if (!allUserCart.length) return;
        for (let user of allUserCart) {
          await user.cart.clearCart!({ restock: true });
        }
      },
    },
  }
);

userSchema.pre('validate', hashPassword);
userSchema.pre('updateOne', hashUpdatedPassword);
userSchema.plugin(softDeletePlugin);
cartSchema.methods.addProduct = addToCart;
cartSchema.methods.removeProduct = removeFromCart;
cartSchema.methods.clearCart = clearCart;
cartSchema.virtual('subtotal').get(cartSubtotal);

export default mongoose.model<IUser, SoftDeleteModel<IUser>>(
  'User',
  userSchema
);

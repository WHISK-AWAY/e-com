import mongoose, { Schema, StringExpression, Types } from 'mongoose';
import Product from './Product';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { v4 as uuid } from 'uuid';
dotenv.config({ path: '../../.env ' });
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
import { softDeletePlugin, SoftDeleteModel } from 'soft-delete-plugin-mongoose';

type TProduct = {
  product: Types.ObjectId;
  price: number;
  qty: number;
};

export interface ICart {
  products: TProduct[];
  subtotal?(): number;
  addProduct?(productId: string, qty: number): void;
  clearCart?(options?: { restock: boolean }): void;
  removeProduct?(productId: StringExpression, qty?: number): void;
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

cartSchema.methods.addProduct = async function (
  productId: string,
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

  const existingProducts: string[] = this.products.map(
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
  await this.parent().save();//balls

  return;
};

cartSchema.methods.removeProduct = async function (
  productId: string,
  qty?: number
): Promise<void> {
  // productId = productId.toString();
  try {
    // const productsInCart: string[] = this.products.map((prod: TProduct) => prod.product.toString());
    const productToRemove: TProduct = this.products.find(
      (prod: TProduct) => prod.product.toString() === productId.toString()
    );
    if (!productToRemove) {
      console.log('no productToRemove');
      return;
    }

    const inventoryProduct = await Product.findById(productId);
    if (!inventoryProduct) {
      console.log('no inventoryProduct');
      return;
    }

    // remove whole item if qty is not provided
    if (!qty) qty = productToRemove.qty;

    // remove the lesser of passed-in qty & qty in cart
    const qtyToRemove = Math.min(qty, productToRemove.qty);

    // add removed qty back to inventory
    inventoryProduct.qty += qtyToRemove;
    await inventoryProduct.save();

    // remove either requested qty or entire product
    if (qty === productToRemove.qty) {
      this.products = this.products.filter(
        (prod: TProduct) => prod.product.toString() !== productId.toString()
      );
    } else {
      for (let prod of this.products) {
        if (prod.product.toString() === productId.toString()) {
          prod.qty -= qtyToRemove;
          break;
        }
      }
    }

    await this.parent().save();
  } catch (err) {
    console.log(err);
  }
};

/**
 * Clear user cart of items
 */
cartSchema.methods.clearCart = async function (
  options: { restock: boolean } = { restock: false }
): Promise<void> {
  if (options.restock) {
    const cartProducts = this.products;
    while (cartProducts.length) {
      const prod = cartProducts.pop();
      await Product.findByIdAndUpdate(prod.product, {
        $inc: { qty: prod.qty },
      });
    }
  }
  await this.parent().updateOne({ $set: { 'cart.products': [] } });
};

cartSchema.virtual('subtotal').get(function (this: ICart) {
  let tot = 0;

  if (!this.products) return tot;

  for (let prod of this.products) {
    tot += prod.price * prod.qty;
  }

  return +tot.toFixed(2);
});

export interface IUser extends mongoose.Document {
  _id: string;
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
  reviewCount: Number,
  voteCount: Number,
  skinConcerns: [String],
});

userSchema.pre('validate', async function () {
  // if(this.password.length > 20 || this.password.length < 8) throw new Error('Do not meet max password length requirement')
  this.password = await bcrypt.hash(this.password, +SALT_ROUNDS!);
});

userSchema.pre('updateOne', async function (next) {
  console.log(this.getUpdate());
  const updatePassword = this.getUpdate() as any;

  if (!updatePassword?.password) return next();
  else
    updatePassword.password = await bcrypt.hash(
      updatePassword.password,
      +SALT_ROUNDS!
    );
  // console.log(Object.keys(updatePassword));
});

userSchema.plugin(softDeletePlugin);

export default mongoose.model<IUser, SoftDeleteModel<IUser>>(
  'User',
  userSchema
);

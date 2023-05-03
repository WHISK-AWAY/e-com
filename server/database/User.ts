import mongoose, { Schema, Types } from 'mongoose';
// const {  Types } = mongoose;

interface Cart {
  products: {
    product: Types.ObjectId;
    price?: number;
    qty: number;
  }[];
  subtotal(): number;
}

const cartSchema = new Schema<Cart>(
  {
    products: [
      {
        product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' },
        qty: Number,
      },
    ],
  },
  {
    virtuals: {
      subtotal: {
        get(this: Cart) {
          const productSubtotal = this.products.reduce((accum: number, product) => {
            return accum + product?.price! * product?.qty;
          }, 0)
          
          return productSubtotal;
        },
        ref: 'Product'
      },
    },
  }
);

interface User {
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
  favorites: Types.ObjectId[];
  cart: Cart;
  role: 'admin' | 'user' | 'guest';
}

const userSchema = new Schema<User>({
  firstName: { type: String, required: true, minLength: 2 },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minLength: 8, maxLength: 20 },
  address: {
    street_1: { type: String, required: true },
    street_2: { type: String, required: false },
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
});

export default mongoose.model('User', userSchema);

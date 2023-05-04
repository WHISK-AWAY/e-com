import mongoose, { Schema, Types } from 'mongoose';

export interface Cart {
  products?: {
    product: { product: Types.ObjectId; price: number };
    qty: number;
  }[];
  subtotal?(): number;
}

const cartSchema = new Schema<Cart>(
  {
    products: [
      {
        product: {
          product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' },
        },
        qty: Number,
      },
    ],
  },
  {
    // virtuals: {
    //   subtotal: {
    //     get(this: Cart) {
    //       const productSubtotal = this?.products?.reduce(
    //         (accum: number, product) => {
    //           return accum + product?.price! * product?.qty;
    //         },
    //         0
    //       );
    //       return productSubtotal;
    //     },
    //     ref: 'Product',
    //   },
    // },
  }
);

export interface User {
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
  cart: Cart;
  role: 'admin' | 'user' | 'guest';
  reviewCount?: number;
  voteCount?: number;
  skinConcerns?: string[];
}

const userSchema = new Schema<User>({
  firstName: { type: String, required: true, minLength: 2 },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minLength: 8, maxLength: 20 },
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

// const generateUser = (count: number): User[] => {
//   const users: User[] = [];

//   for (let i = 0; i < count; i++) {
//     const firstName = faker.name.firstName();
//     const lastName = faker.name.lastName();
//     const email = faker.internet.email(firstName, lastName);
//     const password = faker.internet.password(8);
//     const address = {
//       address_1: faker.address.streetAddress(),
//       address_2: faker.address.secondaryAddress(),
//       city: faker.address.city(),
//       state: faker.address.stateAbbr(),
//       zip: faker.address.zipCode(),
//     };
//     const favorites = [
//       new Types.ObjectId(),
//       new Types.ObjectId(),
//       new Types.ObjectId(),
//     ];
//     const cart = {
//       products: [
//         {
//           product: {
//             product: new Types.ObjectId(),
//             price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 }),
//           },
//           // price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 }),
//           qty: faker.datatype.number(2),
//         },
//       ],
//     };
//     const role = faker.helpers.arrayElement(['admin', 'user', 'guest']) as
//       | 'admin'
//       | 'user'
//       | 'guest';

//     users.push({
//       firstName,
//       lastName,
//       email,
//       password,
//       address,
//       favorites,
//       cart,
//       role,
//     });
//   }
//   return users;
// };

// const mockUsers = generateUser(25);
// console.dir(mockUsers, {depth: 10});

export default mongoose.model('User', userSchema);

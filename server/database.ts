// import dotenv from 'dotenv';
// dotenv.config();
// import User from './database/User';
// import mongoose, { Types, model } from 'mongoose';

// const MONGO_DB_URL = process.env.MONGO_DB_URL!;

// const { Schema } = mongoose;

// main().catch((err) => console.log(err));

// async function main() {
//   await mongoose.connect(MONGO_DB_URL);
//   await User.deleteMany();
//   const user = mongoose.model('User', userSchema);
//   const newUser = new User({
//     firstName: 'ulysses',
//     lastName: 'Cat',
//     email: 'ucat@email.com',
//     password: 'supersecure',
//     address: {
//       street_1: '123 Moonshine dr',
//       city: 'Springfield',
//       state: 'NY',
//       zip: '11223',
//     },
//     cart: {
//       products: {
//         product: new mongoose.Types.ObjectId(),
//         qty: 3,
//       },
//     },
//   });

//   await newUser.save();

//   console.log('connected?');
//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }

// export { main };

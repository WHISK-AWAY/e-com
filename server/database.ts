import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_DB_URL = process.env.MONGO_DB_URL!;

const { Schema } = mongoose;

// const userSchema = new Schema({
//   firstName: String,
//   lastName: String,
//   email: String,

// });

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_DB_URL);
  // const user = mongoose.model('User', userSchema);
  // const newUser = new user({
  //   firstName: 'ulysses',
  //   lastName: 'Cat',
  //   email: 'ucat@email.com',
  // });

  // await newUser.save();


  console.log('connected?');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

export { main };

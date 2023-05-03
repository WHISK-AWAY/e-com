import dotenv from 'dotenv';
dotenv.config();
const MONGO_DB_URL = process.env.MONGO_DB_URL!;
import mongoose, { Types, model } from 'mongoose';
import {
  generateUser,
  generateProduct,
  generateTag,
  generateOrder,
  generatePromo,
} from './faker/mock-data';
import User from './database/User';
import Product from './database/Product';
import Tag from './database/Tag';
import Order from './database/Order';
import Promo from './database/Promo';

export async function seed() {
  await mongoose.connect(MONGO_DB_URL, {
    minPoolSize: 100,
    maxPoolSize: 1000,
    heartbeatFrequencyMS: 5000,
    serverSelectionTimeoutMS: 45000,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
  });
  await mongoose.connection.db.dropDatabase();

  /**
   * * SEEDING USERS
   */
  console.log('Seeding users...');

  const newUser = await User.create(generateUser(25));

  console.log('Seeding uses successful');

  /**
   * * SEEDING PRODUCTS
   */

  console.log('Seeding products...');

  const newProduct = await Product.create(generateProduct(20));
  await Product.create(generateProduct(20));
  await Product.create(generateProduct(20));
  await Product.create(generateProduct(20));
  await Product.create(generateProduct(20));

  console.log('Seeding products successful');

  /**
   * * SEEDING TAGS
   */

  console.log('Seeding tags...');

  const newTag = await Tag.create(generateTag(18));

  console.log('Seeding tags successful');

  /**
   * * SEEDING ORDERS
   */

  console.log('Seeding orders... ');

  const newOrder = await Order.create(generateOrder(20));

  console.log('Seeding orders successful');



  /**
   * * SEEDING PROMOS
   */

  console.log('Seeding promos....');

  const newPromo = await Promo.create(generatePromo(5));

  console.log('Seeding promos successful');




  await mongoose.disconnect();
}

seed();

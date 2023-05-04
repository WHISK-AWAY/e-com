import dotenv from 'dotenv';
dotenv.config();
const MONGO_DB_URL = process.env.MONGO_DB_URL!;
import mongoose, { Types, model } from 'mongoose';
import {
  generateUser,
  generateProduct, // hi buddy!
  generateTag,
  generateOrder,
  generatePromo, //OMGGG
  generateReview,
} from './faker/mock-data';
import Tag from './database/Tag'; // * no dependencies
import Promo from './database/Promo'; // * no dependencies
import Product from './database/Product'; // dependent on Tag
import User from './database/User'; // dependent on Product
import Order from './database/Order'; // dependent on Product, User, Promo
import Review from './database/Review'; // dependent on Product, User

function randomElement<T>(inputArr: T[]): T {
  const i = Math.floor(Math.random() * inputArr.length);
  return inputArr[i];
}

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
   * * SEEDING TAGS
   */

  console.log('Seeding tags...');

  const newTag = await Tag.create(generateTag(18));

  console.log('Seeding tags successful');

  /**
   * * SEEDING PROMOS
   */

  console.log('Seeding promos....');

  const newPromo = await Promo.create(generatePromo(5));

  console.log('Seeding promos successful');

  /**
   * * SEEDING PRODUCTS
   */

  console.log('Seeding products...'); // * experiment with Product.insertMany() instead -- possibly more performant

  const newProduct = await Product.create(generateProduct(20));
  newProduct.push(...(await Product.create(generateProduct(20))));
  newProduct.push(...(await Product.create(generateProduct(20))));
  newProduct.push(...(await Product.create(generateProduct(20))));
  newProduct.push(...(await Product.create(generateProduct(20))));

  // attach tags to products
  for (let product of newProduct) {
    const numberOfTags = Math.floor(Math.random() * 3) + 1;
    product.tags = [];
    for (let i = 1; i <= numberOfTags; i++) {
      product.tags.push(randomElement(newTag)._id);
    }
    await product.save();
  }

  console.log('Seeding products successful');

  /**
   * * SEEDING USERS
   */
  console.log('Seeding users...');

  const newUser = await User.create(generateUser(25));

  for (let user of newUser) {
    // attach products to user favorites
    const numberOfFavorites = Math.floor(Math.random() * 5);
    user.favorites = [];
    for (let i = 0; i < numberOfFavorites; i++) {
      user.favorites.push(randomElement(newProduct)._id);
    }

    // attach products to user cart
    const numberInCart = Math.floor(Math.random() * 5);
    user.cart.products = [];
    for (let i = 0; i < numberInCart; i++) {
      const randomProduct = randomElement(newProduct);
      user.cart.products.push({
        product: randomProduct._id,
        price: randomProduct.price,
        qty: Math.ceil(Math.random() * 3),
      });
    }

    await user.save();
  }

  console.log('Seeding users successful');

  /**
   * * SEEDING ORDERS
   */

  console.log('Seeding orders... ');

  const newOrder = await Order.create(generateOrder(20));

  console.log('Seeding orders successful');

  /**
   * * SEEDING REVIEWS
   */

  console.log('Seeding reviews...');

  const newReview = await Review.create(generateReview(50));

  console.log('Seeding review successful');

  await mongoose.disconnect();
}

seed();

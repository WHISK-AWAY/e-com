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

  // iterate over each order & modify for products & user
  for (let order of newOrder) {
    const orderUser = randomElement(newUser);
    order.user.userId = orderUser._id;
    order.user.shippingInfo = {
      firstName: orderUser.firstName,
      lastName: orderUser.lastName,
      email: orderUser.email,
      address_1: orderUser.address.address_1,
      address_2: orderUser.address.address_2,
      city: orderUser.address.city,
      state: orderUser.address.state,
      zip: orderUser.address.zip,
    };

    // bring in 1 to 5 products
    const numberOfProducts = Math.ceil(Math.random() * 5);
    order.orderDetails = []; // re-initialize order details & repopulate with "real" products

    for (let i = 0; i < numberOfProducts; i++) {
      const productQty = Math.ceil(Math.random() * 3);
      const randomProduct = randomElement(newProduct);

      const orderProduct = {
        productName: randomProduct.productName,
        productDesc: randomProduct.productDesc,
        brand: randomProduct.brand,
        imageURL: randomProduct.imageURL,
        price: randomProduct.price,
        qty: productQty,
      };

      order.orderDetails.push(orderProduct);
    }

    // promo code, sometimes
    order.promoCode!.promoCodeName = '';
    // if (Math.random() <= 0.2) {
    order.promoCode!.promoCodeName = randomElement(newPromo).promoCodeName;
    // }
    await order.save();
  }

  console.log('Seeding orders successful');

  /**
   * * SEEDING REVIEWS
   */

  console.log('Seeding reviews...');

  const newReview = await Review.create(generateReview(50)); // generate a bunch of reviews

  for (let user of newUser) {
    // iterate over each individual user
    // decide how many reviews this user leaves
    const numberOfReviews = Math.floor(Math.random() * 3);

    // iterate through the number we came up with
    for (let i = 0; i <= numberOfReviews; i++) {
      const currentReview = newReview.pop(); // take one review off the list of pre-generated reviews
      // console.log('currentReview:', currentReview);

      if (!currentReview) break; // just a little TS guard

      currentReview.user = user._id; // <-- assigns current user as this review's author
      currentReview.nickname = user.firstName;
      currentReview.location = `${user.address.city}, ${user.address.state}`;

      const reviewProduct = randomElement(newProduct);
      currentReview.product = reviewProduct._id;

      await currentReview.save();
    }
    // pick a review off the list to work with X
    // modify the selected review to attach current user ID & information

    // decide which product this review is for
    // modify the selecte review to attach product ID & information

    // save the review
  }

  const checkReview = await Review.findOne().populate(['user', 'product ']);
  // console.log('Check review:', checkReview);

  console.log('Seeding review successful');
  const oneOrder = await Order.findOne();
  console.log('OneOrder total:', oneOrder?.total);
  console.log('OneOrder subtotal:', oneOrder?.subtotal);

  await mongoose.disconnect();
}

seed();

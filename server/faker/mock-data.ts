import mongoose, { Schema, Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import { User } from '../database/User';
import { Product } from '../database/Product';
import { Tag } from '../database/Tag';
import { Order } from '../database/Order';
import { Promo } from '../database/Promo';
import { Review } from '../database/Review';

/**
 * *USER
 */

export const generateUser = (count: number): User[] => {
  const users: User[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName);
    const password = faker.internet.password(8);
    const address = {
      address_1: faker.address.streetAddress(),
      address_2: faker.address.secondaryAddress(),
      city: faker.address.city(),
      state: faker.address.stateAbbr(),
      zip: faker.address.zipCode(),
    };
    const favorites = [
      new Types.ObjectId(),
      new Types.ObjectId(),
      new Types.ObjectId(),
    ];
    const cart = {
      products: [
        {
          product: {
            product: new Types.ObjectId(),
            price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 }),
          },
          // price: faker.datatype.float({ min: 1, max: 100, precision: 0.01 }),
          qty: faker.datatype.number(2),
        },
      ],
    };
    const role = faker.helpers.arrayElement(['admin', 'user', 'guest']) as
      | 'admin'
      | 'user'
      | 'guest';

    const reviewCount = faker.datatype.number({ min: 0, max: 15 });
    const voteCount = faker.datatype.number({ min: 0, max: 15 });
    const skinConcerns = faker.helpers.arrayElements([
      'oily skin',
      'aging skin',
      'acne prone skin',
      'normal skin',
      'dry skin',
      'sensitive skin',
    ]);

    users.push({
      firstName,
      lastName,
      email,
      password,
      address,
      favorites,
      cart,
      role,
      reviewCount,
      voteCount,
      skinConcerns,
    });
  }
  return users;
};

// const mockUsers = generateUser(25);
// console.dir(mockUsers, { depth: 10 });

/**
 * * PRODUCT
 */

export const generateProduct = (count: number): Product[] => {
  const products = [];

  for (let i = 0; i < count; i++) {
    const productName = faker.commerce.productName();
    const productDesc = faker.commerce.productDescription();
    const brand = faker.company.name();
    const price = faker.datatype.float({ min: 20, max: 1000, precision: 0.01 });
    const qty = faker.datatype.number({ min: 1, max: 5 });
    const imageURL = faker.image.cats();
    const tags = [new Types.ObjectId()];

    products.push({
      productName,
      productDesc,
      brand,
      price,
      qty,
      imageURL,
      tags,
    });
  }

  return products;
};

/**
 * * TAG
 */

export const generateTag = (count: number): Tag[] => {
  const tags = [];

  for (let i = 0; i < count; i++) {
    const tagName = faker.helpers.unique(faker.commerce.department);
    tags.push({ tagName });
  }

  return tags;
};

/**
 * * ORDER
 */

export const generateOrder = (count: number): Order[] => {
  const orders = [];

  for (let i = 0; i < count; i++) {
    const orderDetails = {
      productName: faker.commerce.productName(),
      productDesc: faker.commerce.productDescription(),
      brand: faker.company.name(),
      imageURL: faker.image.cats(),
      price: faker.datatype.float({ min: 20, max: 1000, precision: 0.01 }),
      qty: faker.datatype.number({ min: 1, max: 5 }),
    };
    const user = {
      userId: new mongoose.Types.ObjectId(),
      shippingInfo: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        address_1: faker.address.streetAddress(),
        address_2: faker.address.secondaryAddress(),
        city: faker.address.city(),
        state: faker.address.stateAbbr(),
        zip: faker.address.zipCode(),
      },
      paymentInfo: {
        paymentType: faker.finance.creditCardIssuer(),
        cardNum: faker.finance.creditCardNumber(),
        exp: faker.date.future(4),
        cvv: faker.finance.creditCardCVV(),
      },
    };
    const promoCode = faker.random.word();
    const date = faker.date.recent(20);
    const orderStatus = faker.helpers.arrayElement([
      'pending',
      'confirmed',
      'canceled',
    ]) as 'pending' | 'confirmed' | 'canceled';

    orders.push({
      orderDetails,
      user,
      promoCode,
      date,
      orderStatus,
    });
  }

  return orders;
};

/**
 * * PROMOS
 */

export const generatePromo = (count: number): Promo[] => {
  const promos = [];

  for (let i = 0; i < count; i++) {
    const promoCodeName = faker.helpers.unique(faker.random.word);
    const promoRate = faker.datatype.number({
      max: 0.2,
      min: 0.02,
      precision: 0.01,
    });

    promos.push({
      promoCodeName,
      promoRate,
    });
  }

  return promos;
};

/**
 * * REVIEW
 */

export const generateReview = (count: number): Review[] => {
  const reviews = [];

  for (let i = 0; i < count; i++) {
    const title = faker.word.conjunction();
    const content = faker.lorem.sentence();
    const date = faker.date.recent();
    const rating = {
      overall: faker.datatype.number({ min: 1, max: 5 }),
      quality: faker.datatype.number({ min: 1, max: 5 }),
      value: faker.datatype.number({ min: 1, max: 5 }),
    };
    const nickname = faker.internet.userName();
    const location = `${faker.address.cityName()},  ${faker.address.stateAbbr()}`;
    const upvote = faker.datatype.number({ min: 0, max: 14 });

    reviews.push({
      title,
      content,
      date,
      rating,
      nickname,
      location,
      upvote,
    });
  }
  return reviews;
};

// const mockProducts = generateProduct(100);
// console.dir(mockProducts, { depth: 10 });

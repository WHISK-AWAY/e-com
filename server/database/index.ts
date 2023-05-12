export { default as Order, IOrder } from './Order';
export { default as Promo, IPromo } from './Promo';
export { default as Product, IProduct } from './Product';
export { default as Review, IReview } from './Review';
export { default as Tag, ITag } from './Tag';
export { default as User } from './User';
export { IUser, ICart, TCartReturn, TProduct } from './dbTypes';
export { default as UserVote, IUserVote } from './UserVote';

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
const MONGO_DB_URL = process.env.MONGO_DB_URL;

export async function mongooseConnection() {
  return await mongoose.connect(MONGO_DB_URL!, {
    minPoolSize: 100,
    maxPoolSize: 1000,
    heartbeatFrequencyMS: 5000,
    serverSelectionTimeoutMS: 45000,
    // keepAlive: true,
    // keepAliveInitialDelay: 300000,
  });
}

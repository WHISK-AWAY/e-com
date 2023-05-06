export { default as Order } from './Order';
export { default as Promo } from './Promo';
export { default as Product } from './Product';
export { default as Review } from './Review';
export { default as Tag } from './Tag';
export { default as User } from './User';
export { default as UserVote } from './UserVote';

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

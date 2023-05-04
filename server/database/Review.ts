import mongoose, { Schema, Types } from 'mongoose';

export interface Review {
  title: string;
  content: string;
  date: Date;
  rating: {
    overall: number;
    quality: number;
    value: number;
  };
  nickname?: string;
  location?: string;
  verifiedPurchase(): boolean;
  vote?: number;
}


const reviewSchema = new Schema<Review>({
  title: {type: String, required: true},
  content: { type: String, required: true},
  date: { type: Date, required: true, default: Date.now},
  rating: {
    overall: { type: Number, required: true},
    quality: { type: Number, required: true},
    value: { type: Number, required: true},
  },
  nickname: String,
  location: String,
  vote: Number
});


// reviewSchema.virtual('verifiedPurchase').get() {

// }
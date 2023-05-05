import mongoose, { Schema, Types } from 'mongoose';
import User from './User';
import Order from './Order';

export interface Review {
  product: Types.ObjectId;
  title: string;
  content: string;
  date: Date;
  rating: {
    overall: number;
    quality: number;
    value: number;
  };
  user: Types.ObjectId;
  nickname?: string;
  location?: string;
  verifiedPurchase?: boolean;
  upvote?: number;
  downvote?: number;
}

const reviewSchema = new Schema<Review>({
  product: { type: mongoose.SchemaTypes.ObjectId, ref: 'Product' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  rating: {
    overall: { type: Number, required: true },
    quality: { type: Number, required: true },
    value: { type: Number, required: true },
  },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  nickname: String,
  location: String,
  verifiedPurchase: Boolean,
  upvote: Number,
  downvote: Number,
});

reviewSchema.pre('save', async function (next) {
  if (!this.isNew) return next();


  const order = await Order.findOne({
    'user.userId': this.user,
    'orderDetails.productId': { $eq: this.product }, 'orderStatus': {$eq: 'confirmed'}
  }).exec();

  if (order && order.orderStatus === 'confirmed') {
    this.verifiedPurchase = true;
  }
  console.log('order', order);
  // console.log('suer', this.user);
  // console.log('product', this.product);

  // console.log('order', order);

  next();
});

// reviewSchema.post('save', async function (doc, next) {
//   // console.log('post-save "this":', this);
//   const author = await User.findById(doc.user);

//   if (!author) return next();

//   if (author.reviewCount) {
//     author.reviewCount += 1;
//   } else author.reviewCount = 1;

//   next();
// });

export default mongoose.model('Review', reviewSchema);

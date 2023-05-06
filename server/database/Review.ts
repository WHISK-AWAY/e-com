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
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Product',
    required: true,
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
  rating: {
    overall: { type: Number, required: true },
    quality: { type: Number, required: true },
    value: { type: Number, required: true },
  },
  user: { type: mongoose.SchemaTypes.ObjectId, ref: 'User' },
  nickname: { type: String, required: true },
  location: { type: String, required: true },
  verifiedPurchase: { type: Boolean, required: true, default: false },
  upvote: { type: Number, required: true, default: 0 },
  downvote: { type: Number, required: true, default: 0 },
});

// determine whether this review is a verified purchase
reviewSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  const order = await Order.findOne({
    'user.userId': this.user,
    'orderDetails.productId': { $eq: this.product },
    orderStatus: { $eq: 'confirmed' },
  }).exec();

  if (order) this.verifiedPurchase = true;
  // console.log('order', order);

  next();
});

// increment reviewer's review count
reviewSchema.pre('save', async function (next) {
  if (!this.isNew) return next();

  let updatedUser = await User.findByIdAndUpdate(this.user, {
    $inc: { reviewCount: 1 },
  });
  // console.log('updatedUser:', JSON.parse(JSON.stringify(updatedUser)));
  // there she is :) looking to see if I can find some kinda increment operator -- not sure how to say "take what you find and add one"
  // could find the record, add one to it, and save - just trying to get it done in 1
  // well, that wasn't it
  //doing good, youll get there, lets fooking gooooooo <---- got it, that one worked
  //oh i cant see, but fck yea
  // returned the pre-updated record & looked it up after...goes from 4 to 5
  //are we gonna do the same for upvote + downvote? yes, somehow....have to land a hook on review updates, but only where upvote/downvote values were updated...not sure yet how to do that one
  //oh yes massage time  ----- relax & enjoy yourself ------ this is far more interesting im sorry
  // you got problems but i'm glad you're here :)<---- ass, glad to be here bud
  // no idea how to pull out which user is making the update...
  //but do we care? how about we just count how many upvotes/downvotes our review got? so we just take our own review and check if we have any rating activity <-- the review keeps up with its own count, but i'm wanting to keep track of how many times this user has voted on any review <--- to prevent double voting? that too...was just thinking about that...in order to prevent double-voting*, either A) the review has to keep track of who's voted on it, or B) the user has to keep track of which reviews they've voted on....either one could get awkward <---ok i see, yea makes sense
  // may need to do it in the route instead, or possibly as an instance method which takes in the voting user's ID
  // gears are turning only very slowly... ;)
  // we are not on anybodys schedule bud, take your time its still early..had coffee? almost thru the 1st cup   banana coffee is waiting for me home    ohh shit lucky you  ill let you know if its any better than hes pickled(?) brother
  // not expecting any dramatic upsets on that one
});

// reviewSchema.methods.upvote = function () {
// nah, still don't know who's doing the voting...
//we can try to pull up userId of this particular review, check if its matching and make sure this user id voted either up or down only once per one review
//pattyb still here? yes'm still with you :) thinking & reading      take your time
// running out of ideas; i think we have to manage the user's vote total within the express route as a separate query
// and maybe avoid double-voting with a small document containing userid & reviewid, like a many:many through-table? would make sense to have a user track their own voted-on reviews, but that's the unbounded-array problem
// };

reviewSchema.post('save', async function (doc, next) {
  // shit im trying to find the chat lol, yea i see your struggle
  //   // console.log('post-save "this":', this);
  const author = await User.findById(doc.user);

  if (!author) return next();

  if (author.reviewCount) {
    author.reviewCount += 1;
  } else author.reviewCount = 1;

  next();
});

export default mongoose.model('Review', reviewSchema);

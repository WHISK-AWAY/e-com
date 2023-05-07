import mongoose, { Schema, Types } from 'mongoose';
import User from './User';

export interface IUserVote {
  userId: string;
  reviewId: Types.ObjectId;
}
//is there a reason you dont want to do it as a subdoc?
// it's an unbounded array...if someone is fucking around clicking on reviews all day, their user doc will get too big
// do subdocs contribute to the size of a parent? I was assuming so, but I don't know that...
//wonder how many reviews do you have to like in order to exceed the limit
// a lot "squillions"
//found *some* info on it, kinda makes sense <-- yep thank you! np! we won't actually run into trouble, but if we're thinking scaling then have to consider it      true
//think im almost done here, nope 10 mmore minutes:(((
//lol happens. so what are you thinking
//// congrats you've survived it; //// hope you're happy with the outcome
// build out this schema, look for other odds & ends to mess with, getting close to express time
// which means we'll have to make some calls on auth very soon :`( <--- EXCITING
// (yay) mmm we'll make it fun   oh good call in that case fuck yeah auth!!!!!!! thats the spirit

const UserVoteSchema = new Schema<IUserVote>({
  userId: { type: String, required: true },
  reviewId: { type: mongoose.SchemaTypes.ObjectId, required: true },
});

UserVoteSchema.pre('save', async function () {
  // update user's vote count
  await User.findByIdAndUpdate(this.userId, { $inc: { voteCount: 1 } });
});

export default mongoose.model('UserVote', UserVoteSchema);
// ok done 
// are those apples? you guessed it right - gonna have to go buy a mac so i can see 'em <---support gonna be just like my buddy anastasia someday   please dont, apparently loggin into your github is not enough to become you  was a good attempt though, credit for that didnt mean to:( still amazed you managed it, well done

// must be wrapping up :)

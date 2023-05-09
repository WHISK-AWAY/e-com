import mongoose, { Schema, Types } from 'mongoose';

export interface ITag {
  _id?: Types.ObjectId;
  tagName: string;
}

const tagSchema = new Schema<ITag>({
  tagName: { type: String, required: true, unique: true, minlength: 3 },
});

export default mongoose.model('Tag', tagSchema);

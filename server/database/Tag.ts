import mongoose, { Schema, Types, model } from 'mongoose';

export interface ITag {
  _id?: Types.ObjectId;
  tagName: string;
}

const tagSchema = new Schema<ITag>({
  tagName: { type: String, required: true, unique: true },
});

export default mongoose.model('Tag', tagSchema);

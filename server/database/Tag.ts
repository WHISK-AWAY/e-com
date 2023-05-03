import mongoose, { Schema, Types, model } from 'mongoose';

export interface Tag {
  _id?: Types.ObjectId;
  tagName: string;
}

const tagSchema = new Schema<Tag>({
  tagName: { type: String, required: true, unique: true },
});

export default mongoose.model('Tag', tagSchema);

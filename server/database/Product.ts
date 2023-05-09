import mongoose, { Schema, Types } from 'mongoose';

export interface IProduct {
  _id?: Types.ObjectId;
  productName: string;
  productDesc: string;
  brand: string;
  price: number;
  qty: number;
  imageURL: string;
  tags: Types.ObjectId[];
}

const productSchema = new Schema<IProduct>({
  productName: { type: String, required: true, unique: true },
  productDesc: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  imageURL: { type: String, required: true },
  tags: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Tag',
    },
  ],
});

export default mongoose.model('Product', productSchema);

import mongoose, { Schema, Types, model } from 'mongoose';

export interface IPromo {
  _id?: Types.ObjectId;
  promoCodeName: string;
  promoRate: number;
}

const promoSchema = new Schema<IPromo>({
  promoCodeName: { type: String, required: true },
  promoRate: { type: Number, required: true },
});

export default mongoose.model('Promo', promoSchema);

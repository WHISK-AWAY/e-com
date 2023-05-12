import mongoose, { Schema, Types } from 'mongoose';

export const MAX_PROMO_RATE = 0.5;

export interface IPromo {
  _id?: Types.ObjectId;
  promoCodeName: string;
  promoRate: number;
}

const promoSchema = new Schema<IPromo>({
  promoCodeName: { type: String, required: true, unique: true },
  promoRate: { type: Number, required: true },
});

export default mongoose.model('Promo', promoSchema);

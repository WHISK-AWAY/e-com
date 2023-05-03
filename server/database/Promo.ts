import mongoose, { Schema ,Types, model } from 'mongoose';

export interface Promo {
  _id?: Types.ObjectId
  promoCodeName: string
  promoRate: number,

}


const promoSchema = new Schema<Promo>({
  promoCodeName: {type: String, required: true},
  promoRate: {type: Number, required: true}
})


export default mongoose.model('Promo', promoSchema)
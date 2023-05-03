import mongoose, { Schema, Types, model } from 'mongoose';
// import { faker } from '@faker-js/faker';

export interface Product {
  _id?: Types.ObjectId;
  productName: string;
  productDesc: string;
  brand: string;
  price: number;
  qty: number;
  imageURL: string;
  tags: Types.ObjectId[];
}

const productSchema = new Schema<Product>({
  productName: { type: String, required: true },
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

// const generateProduct = (count: number): Product[] => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const productName = faker.commerce.productName();
//     const productDesc = faker.commerce.productDescription();
//     const brand = faker.company.name();
//     const price = faker.datatype.float({ min: 20, max: 1000, precision: 0.01 });
//     const qty = faker.datatype.number({ min: 1, max: 5 });
//     const imageURL = faker.image.cats();
//     const tags = [new Types.ObjectId()];

//     products.push({
//       productName,
//       productDesc,
//       brand,
//       price,
//       qty,
//       imageURL,
//       tags,
//     });
//   }

//   return products;
// };

// const mockProducts = generateProduct(100);
// console.dir(mockProducts, {depth: 10})

export default mongoose.model('Product', productSchema);

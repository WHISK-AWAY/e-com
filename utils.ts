import {z} from 'zod';

export const zodUser = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(20),
  address: z.object({
    address_1: z.string(),
    address_2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
  }),
  confirmPassword: z.string().min(8).max(20),
});


export const zodProduct = z.object({
  productName: z.string().min(3),
  productDesc: z.string().min(10),
  brand: z.string().min(3),
  price: z.number().nonnegative().gt(20),
  qty: z.number().nonnegative().gt(0),
  imageURL: z.string().url(),
  tags: z.string().min(3).array(),
});

export const zodReview = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  rating: z.object({
    overall: z.number().nonnegative().gte(1).lte(5),
    quality: z.number().nonnegative().gte(1).lte(5),
    value: z.number().nonnegative().gte(1).lte(5),
  }),
  nickname: z.string().min(2).optional(),
  location: z.string().min(3).optional(),
});
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

export const zodOrder = z.object({
  orderDetails: z.object({
    productId: z.string(),
    qty: z.number().min(1)
  }).array(),
  user: z.object({
    shippingInfo: z.object({
      firstName: z.string().min(2),
      lastName: z.string().min(2),
      email: z.string().email(),
      address_1: z.string().min(5),
      address_2: z.string().min(2).optional(),
      city: z.string().min(1),
      state: z.string().min(2),
      zip: z.string().min(5),
    }),
    paymentInfo: z.object({
      paymentType: z.string().min(3),
      cardNum: z.string().min(16),
      exp: z.string(),
      cvv: z.string().min(3),
    }),
  }),
  promoCode: z
    .object({
      promoCodeName: z.string().min(2),
      
    })
    .optional(),
});
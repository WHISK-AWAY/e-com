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

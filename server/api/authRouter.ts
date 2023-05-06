import express from 'express';
// import axios from 'axios';
import { User } from '../database/index';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const router = express.Router();
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const SECRET = process.env.SECRET;
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const zodUser = z
  .object({
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
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password fields do  not match',
      });
    }
  });

router.post('/signup', async (req, res, next) => {
  try {
    const parsedBody = zodUser.parse(req.body);
    // delete parsedBody.confirmPassword;
    const newUser = await User.create(parsedBody);
    res.status(200).json(newUser);
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userLookup = await User.findOne({ email });
    if (!userLookup)
      return res.status(404).send('Cannot find user withn given email');
    const comparePass = await bcrypt.compare(password, userLookup.password);
    if (!comparePass)
      return res.status(403).send('Password does not match database records');

    const token = jwt.sign({ id: userLookup._id, role: userLookup.role }, SECRET!);
    if (!token) return res.status(500).send('Secret is broken');

    res.status(200).json(token);
  } catch (err) {
    next(err);
  }
});


export default router;

// router.get('/login', async (req, res, next) => {
//   try {
//     const { data } = await axios.post(
//       'https://dev-z5aj5eewyq3duaqc.us.auth0.com/oauth/token',
//       {
//         client_id: 'eW7bfGKjfMoKlIVRiuev2ehC7Boy5XUd',
//         client_secret:
//           'REDgfT-NsYPiVXrj4kfx4eYw5F0BjaSbpovRfYwK5caX_eVb4_5LwVbqxH-MEiio',
//         audience: 'e-comPB',
//         grant_type: 'client_credentials',
//       },
//       { headers: { 'content-type': 'application/json' } }
//     );

//     res.status(200).json(data);
//   } catch (err) {
//     next(err);
//   }
// });

// router.get('/login', async (req, res, next) => {
//   try {
//     const { data } = await axios.post(
//       'https://dev-3nurd80vhso7rxtr.us.auth0.com/oauth/token',
//       {
//         client_id: 'vrf63x8WdTTChYHTEcdP6n79ciqpxPK8',
//         client_secret:
//           'h_HW63aY0BsKtZasU3Yoju_AXp4NBldAksQ3Lh-q5Kcl2z7sQah1XRbVfBXiwjGo',
//         audience: 'e-com',
//         grant_type: 'client_credentials',
//       },
//       { headers: { 'content-type': 'application/json' } }
//     );

//     res.status(200).json(data);
//   } catch (err) {
//     next(err);
//   }
// });

// export default router;

import express from 'express';
const router = express.Router();
import { User, mongooseConnection } from '../database/index';
import { requiresAuth, claimCheck } from 'express-openid-connect';
import { nextTick } from 'process';
// import { jwtCheck, requiresAdmin } from './authMiddleware';

router.get(
  '/',
  requiresAuth(), // :````((((
  // claimCheck((req, claims) => {
  //   console.log(claims);
  //   return true;
  // }),
  async (req, res, next) => {
    try {
      // await mongooseConnection();
      // const users = await User.find();
      // const users = await req.oidc.fetchUserInfo();
      res.status(200).json('send help');
    } catch (err) {
      next(err);
    }
  }
);

export default router;

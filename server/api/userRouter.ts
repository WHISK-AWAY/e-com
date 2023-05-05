import express from 'express';
const router = express.Router();
import { User, mongooseConnection } from '../database/index';
import { jwtCheck } from './authMiddleware';





router.get('/', jwtCheck,  async (req, res, next) => {
  try {
    await mongooseConnection();
    const users = await User.find();

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
});





export default router;

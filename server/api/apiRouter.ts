import express from 'express';
import userRouter from './userRouter';
import authRouter from './authRouter';
import productRouter from './productRouter';
import adminOrderRouter from './adminOrderRouter';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/product', productRouter);
router.use('/adminOrder', adminOrderRouter);

export default router;

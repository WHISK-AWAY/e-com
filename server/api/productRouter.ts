import express from 'express';
const router = express.Router();
import { Product, Tag } from '../database/index';
import { checkAuthenticated, requireAdmin } from './authMiddleware';
import { z } from 'zod';
import mongoose from 'mongoose';

const zodProduct = z.object({
  productName: z.string().min(3),
  productDesc: z.string().min(10),
  brand: z.string().min(3),
  price: z.number().nonnegative().gt(20),
  qty: z.number().nonnegative().gt(0),
  imageURL: z.string().url(),
  tags: z.string().min(3).array().nonempty(),
  // .refine((tags) => {
  //   return tags.every((id) => mongoose.Types.ObjectId.isValid(id));
  // }),
});
// .strict();
// .refine(({ _id }) => mongoose.Types.ObjectId.isValid(_id));

router.get('/', async (req, res, next) => {
  try {
    const allProducts = await Product.find().populate({ path: 'tags' });

    if (!allProducts.length) return res.status(404).send('No products found');

    res.status(200).json(allProducts);
  } catch (err) {
    next(err);
  }
});

router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate({
      path: 'tags',
    });

    if (!product) return res.status(404).send('Product does not exist');

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

router.post('/', checkAuthenticated, requireAdmin, async (req, res, next) => {
  try {
    const parsedBody = zodProduct.parse(req.body);
    if (!parsedBody) return res.status(404).send('All fields required');

    const existingTag = await Tag.find({ tagName: parsedBody.tags });

    const tagLookup = existingTag.map((tag: any) => tag.tagName);

    const tagId = existingTag.map((tag: any) => tag.id);
    let newTag;
    for (let tag of parsedBody.tags) {
      if (!tagLookup.includes(tag)) {
        newTag = await Tag.create({ tagName: tag });
        tagId.push(newTag?.id);
      }
    }

    parsedBody.tags = tagId;

    const newProduct = await Product.create(parsedBody);

    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

export default router;

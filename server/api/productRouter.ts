import express from 'express';
const router = express.Router({ mergeParams: true});
import reviewRouter from './reviewRouter';
import { Product, Tag } from '../database/index';
import { checkAuthenticated, requireAdmin } from './authMiddleware';
import { z } from 'zod';
import mongoose from 'mongoose';
import { zodProduct } from '../../utils';

const createZodProduct = zodProduct.strict();
const updateZodProduct = zodProduct
  .deepPartial()
  .required({ tags: true })
  .strict();

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
    const parsedBody = createZodProduct.parse(req.body);
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

router.put(
  '/:productId',
  checkAuthenticated,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { productId } = req.params;
      const parsedBody = updateZodProduct.parse(req.body);
      const existingTag = await Tag.find();
      const incomingTag = parsedBody.tags;
      let updateProduct;
      const tagId = [];
      if (!parsedBody) return res.status(400).send('No fields to update');

      // useless, but i like him
      if (!incomingTag || !incomingTag.length) {
        parsedBody.tags = [];
      }

      const existingTagName: string[] = existingTag.map(
        (tag: any) => tag.tagName
      );

      console.log('ET', existingTagName);
      for (let tag of incomingTag!) {
        console.log('tag', tag);
        if (!existingTagName.includes(tag)) {
          const newTag = await Tag.create({ tagName: tag });
          tagId.push(newTag.id);
        } else {
          const oldTag = existingTag.find((tags: any) => tags.tagName === tag);
          tagId.push(oldTag._id);
        }
      }
      parsedBody.tags = tagId;
      updateProduct = await Product.updateOne(parsedBody);

      res.status(200).json(updateProduct);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:productId',
  checkAuthenticated,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { productId } = req.params;

      const deleteProduct = await Product.deleteOne({ _id: productId });
      if (deleteProduct.deletedCount === 0)
        return res
          .status(400)
          .send('Trouble deleting product, it might not exist');

      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }
);

router.use('/:productId/review', reviewRouter);

export default router;

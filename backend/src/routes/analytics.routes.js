import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { ProductStat } from '../models/ProductStat.js';

const router = Router();

const clickSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  image: z.string().optional(),
  unitPrice: z.number().nonnegative().optional(),
  category: z.string().optional(),
});

router.post(
  '/product-click',
  asyncHandler(async (req, res) => {
    const body = clickSchema.parse(req.body);

    const stat = await ProductStat.findOneAndUpdate(
      { productId: body.productId },
      {
        $inc: { clicks: 1 },
        $set: {
          productName: body.productName,
          ...(body.image !== undefined ? { image: body.image } : {}),
          ...(body.unitPrice !== undefined ? { unitPrice: body.unitPrice } : {}),
          ...(body.category !== undefined ? { category: body.category } : {}),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, clicks: stat.clicks });
  })
);

router.get(
  '/top-products',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 6, 24);
    const products = await ProductStat.find({ clicks: { $gt: 0 } })
      .sort({ clicks: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      products: products.map((p) => ({
        id: p.productId,
        name: p.productName,
        image: p.image || '',
        unitPrice: p.unitPrice || 0,
        category: p.category || 'Catalog',
        clicks: p.clicks,
      })),
    });
  })
);

export default router;

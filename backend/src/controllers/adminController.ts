import { Request, Response } from 'express';
import { z } from 'zod';
import db from '../config/db';

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
    .replace(/[\s_]+/g, '-')     // replace spaces and underscores with hyphens
    .replace(/-+/g, '-')         // remove duplicate hyphens
    .replace(/(^-|-$)/g, '');    // trim hyphens from ends
};

// Store Validation Schemas
const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  logo: z.string().url('Logo must be a valid URL or image path').or(z.string().min(1, 'Logo is required')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
});

const updateStoreSchema = createStoreSchema.partial();

// Coupon Validation Schemas
const createCouponSchema = z.object({
  storeId: z.string().uuid('Invalid Store ID').or(z.string().min(1, 'Store ID is required')),
  couponCode: z.string().min(3, 'Coupon code must be at least 3 characters'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  discountType: z.enum(['PERCENTAGE', 'FLAT']),
  discountValue: z.number().positive('Discount value must be positive'),
  expiryDate: z.string().transform((str) => new Date(str)),
  active: z.boolean().default(true),
  terms: z.string().optional(),
});

const updateCouponSchema = createCouponSchema.partial();

// --- Store CRUD ---

export const createStore = async (req: Request, res: Response) => {
  try {
    const validation = createStoreSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { name, logo, description, category } = validation.data;
    const slug = generateSlug(name);

    // Verify unique slug
    const existing = await db.store.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ message: `A store with the slug '${slug}' already exists` });
    }

    const store = await db.store.create({
      data: { name, slug, logo, description, category },
    });

    return res.status(201).json({ message: 'Store created successfully', store });
  } catch (error) {
    console.error('Create store error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateStoreSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    // Verify store exists
    const existingStore = await db.store.findUnique({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const updateData: any = { ...validation.data };

    // If name is changing, update the slug
    if (validation.data.name && validation.data.name !== existingStore.name) {
      const slug = generateSlug(validation.data.name);
      const existingSlug = await db.store.findFirst({
        where: { slug, id: { not: id } },
      });
      if (existingSlug) {
        return res.status(400).json({ message: `A store with the slug '${slug}' already exists` });
      }
      updateData.slug = slug;
    }

    const store = await db.store.update({
      where: { id },
      data: updateData,
    });

    return res.json({ message: 'Store updated successfully', store });
  } catch (error) {
    console.error('Update store error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingStore = await db.store.findUnique({ where: { id } });
    if (!existingStore) {
      return res.status(404).json({ message: 'Store not found' });
    }

    await db.store.delete({ where: { id } });

    return res.json({ message: 'Store and all associated coupons deleted successfully' });
  } catch (error) {
    console.error('Delete store error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// --- Coupon CRUD ---

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const validation = createCouponSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { storeId, couponCode, title, description, discountType, discountValue, expiryDate, active, terms } = validation.data;

    // Verify store exists
    const storeExists = await db.store.findUnique({ where: { id: storeId } });
    if (!storeExists) {
      return res.status(404).json({ message: 'Target store does not exist' });
    }

    const coupon = await db.coupon.create({
      data: {
        storeId,
        couponCode: couponCode.toUpperCase().trim(),
        title,
        description,
        discountType,
        discountValue,
        expiryDate,
        active,
        terms,
      },
    });

    return res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    console.error('Create coupon error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateCouponSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    // Verify coupon exists
    const existingCoupon = await db.coupon.findUnique({ where: { id } });
    if (!existingCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    const updateData: any = { ...validation.data };
    if (updateData.couponCode) {
      updateData.couponCode = updateData.couponCode.toUpperCase().trim();
    }

    // Verify store if storeId is changing
    if (updateData.storeId && updateData.storeId !== existingCoupon.storeId) {
      const storeExists = await db.store.findUnique({ where: { id: updateData.storeId } });
      if (!storeExists) {
        return res.status(404).json({ message: 'Target store does not exist' });
      }
    }

    const coupon = await db.coupon.update({
      where: { id },
      data: updateData,
    });

    return res.json({ message: 'Coupon updated successfully', coupon });
  } catch (error) {
    console.error('Update coupon error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCoupon = await db.coupon.findUnique({ where: { id } });
    if (!existingCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await db.coupon.delete({ where: { id } });

    return res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Delete coupon error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin metrics check
export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const storesCount = await db.store.count();
    const couponsCount = await db.coupon.count();
    const usersCount = await db.user.count();

    const topStores = await db.store.findMany({
      include: {
        _count: {
          select: { coupons: true }
        }
      },
      orderBy: { coupons: { _count: 'desc' } },
      take: 5
    });

    const revealStats = await db.coupon.aggregate({
      _sum: { revealCount: true },
      _max: { revealCount: true }
    });

    return res.json({
      stats: {
        storesCount,
        couponsCount,
        usersCount,
        totalReveals: revealStats._sum.revealCount || 0,
        maxRevealedCoupon: revealStats._max.revealCount || 0,
        topStores: topStores.map(s => ({ name: s.name, count: s._count.coupons }))
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

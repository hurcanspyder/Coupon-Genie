import { Request, Response } from 'express';
import db from '../config/db';

// Get all stores with active coupon counts
export const getStores = async (req: Request, res: Response) => {
  try {
    const stores = await db.store.findMany({
      include: {
        _count: {
          select: {
            coupons: {
              where: { active: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Formatting counts clearly
    const formattedStores = stores.map((store) => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logo,
      description: store.description,
      category: store.category,
      couponCount: store._count.coupons,
      createdAt: store.createdAt,
    }));

    return res.json({ stores: formattedStores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Live search stores by name or category
export const searchStores = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({ stores: [] });
    }

    const stores = await db.store.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: {
            coupons: {
              where: { active: true },
            },
          },
        },
      },
      take: 10,
    });

    const formattedStores = stores.map((store) => ({
      id: store.id,
      name: store.name,
      slug: store.slug,
      logo: store.logo,
      category: store.category,
      couponCount: store._count.coupons,
    }));

    return res.json({ stores: formattedStores });
  } catch (error) {
    console.error('Error searching stores:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single store details by slug, including active coupons
export const getStoreBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const store = await db.store.findUnique({
      where: { slug },
      include: {
        coupons: {
          where: { active: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const activeCouponsCount = store.coupons.length;

    return res.json({
      store: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        logo: store.logo,
        description: store.description,
        category: store.category,
        couponCount: activeCouponsCount,
        coupons: store.coupons,
      },
    });
  } catch (error) {
    console.error('Error fetching store detail:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Reveal a random active coupon for a store slug
export const revealRandomCoupon = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const store = await db.store.findUnique({
      where: { slug },
      include: {
        coupons: {
          where: { active: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const activeCoupons = store.coupons;

    if (activeCoupons.length === 0) {
      return res.status(404).json({ message: 'No active coupons available for this store' });
    }

    // Select random coupon
    const randomIndex = Math.floor(Math.random() * activeCoupons.length);
    const selectedCoupon = activeCoupons[randomIndex];

    // Increment reveal count in database
    const updatedCoupon = await db.coupon.update({
      where: { id: selectedCoupon.id },
      data: {
        revealCount: {
          increment: 1,
        },
      },
    });

    return res.json({
      coupon: {
        id: updatedCoupon.id,
        couponCode: updatedCoupon.couponCode,
        title: updatedCoupon.title,
        description: updatedCoupon.description,
        discountType: updatedCoupon.discountType,
        discountValue: updatedCoupon.discountValue,
        expiryDate: updatedCoupon.expiryDate,
        terms: updatedCoupon.terms,
        revealCount: updatedCoupon.revealCount,
      },
    });
  } catch (error) {
    console.error('Error revealing random coupon:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get overall trending coupons across all stores
export const getTrendingCoupons = async (req: Request, res: Response) => {
  try {
    const trending = await db.coupon.findMany({
      where: { active: true },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
      },
      orderBy: { revealCount: 'desc' },
      take: 6,
    });

    return res.json({ coupons: trending });
  } catch (error) {
    console.error('Error fetching trending coupons:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import db from '../config/db';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'coupon_genie_super_secret_jwt_key_98765';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { name, email, password } = validation.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // First user registered can be ADMIN, subsequent users are normal USERs
    const userCount = await db.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ errors: validation.error.format() });
    }

    const { email, password } = validation.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  return res.json({ user: req.user });
};

// Save a coupon
export const saveCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!couponId) {
      return res.status(400).json({ message: 'Coupon ID is required' });
    }

    // Verify coupon exists
    const coupon = await db.coupon.findUnique({ where: { id: couponId } });
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Check if already saved
    const alreadySaved = await db.userSavedCoupon.findUnique({
      where: {
        userId_couponId: {
          userId: req.user.id,
          couponId,
        },
      },
    });

    if (alreadySaved) {
      return res.status(200).json({ message: 'Coupon already saved' });
    }

    await db.userSavedCoupon.create({
      data: {
        userId: req.user.id,
        couponId,
      },
    });

    return res.status(201).json({ message: 'Coupon saved successfully' });
  } catch (error) {
    console.error('Save coupon error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Unsave a coupon
export const unsaveCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { couponId } = req.body;
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    if (!couponId) {
      return res.status(400).json({ message: 'Coupon ID is required' });
    }

    await db.userSavedCoupon.delete({
      where: {
        userId_couponId: {
          userId: req.user.id,
          couponId,
        },
      },
    });

    return res.json({ message: 'Coupon unsaved successfully' });
  } catch (error) {
    console.error('Unsave coupon error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all saved coupons for a user
export const getSavedCoupons = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const saved = await db.userSavedCoupon.findMany({
      where: { userId: req.user.id },
      include: {
        coupon: {
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
        },
      },
      orderBy: { savedAt: 'desc' },
    });

    const coupons = saved.map((s) => ({
      ...s.coupon,
      savedAt: s.savedAt,
    }));

    return res.json({ coupons });
  } catch (error) {
    console.error('Get saved coupons error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 register/login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many login or registration attempts. Please try again after 15 minutes',
  },
});

export const revealLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 coupon reveals per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Slow down! You can only reveal 15 coupons per minute.',
  },
});

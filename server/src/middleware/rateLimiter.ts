import rateLimit from 'express-rate-limit';
import AppError from '../utils/AppError';

export const rateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: new AppError('Too many requests from this IP, please try again later', 429),
    standardHeaders: true,
    legacyHeaders: false,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: new AppError('Too many authentication attempts, please try again later', 429),
    standardHeaders: true,
    legacyHeaders: false,
});

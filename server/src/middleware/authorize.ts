import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import AppError from '../utils/AppError';

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }

        // Role check will be implemented after we fetch user role from DB
        // This is a placeholder - actual role checking happens in service layer
        next();
    };
};

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimiter';
import { asyncHandler } from '../../middleware/asyncHandler';
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema,
} from './auth.schema';
import {
    register,
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    getCurrentUser,
    updateProfile,
    changePassword,
    deleteAccount,
} from './auth.controller';

const router = Router();

// Public routes
router.post(
    '/register',
    authLimiter,
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('fullName').trim().isLength({ min: 2 }),
    validate,
    asyncHandler(async (req, res) => {
        const result = await register(req.body);
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification.',
            data: result,
        });
    })
);

router.post(
    '/login',
    authLimiter,
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate,
    asyncHandler(async (req, res) => {
        const result = await login(req.body.email, req.body.password);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: result.user,
                accessToken: result.accessToken,
            },
        });
    })
);

router.post(
    '/refresh',
    asyncHandler(async (req, res) => {
        const refreshTokenCookie = req.cookies.refreshToken;

        if (!refreshTokenCookie) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required',
            });
        }

        const result = await refreshToken(refreshTokenCookie);

        // Set new refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    })
);

router.post(
    '/forgot-password',
    authLimiter,
    body('email').isEmail().normalizeEmail(),
    validate,
    asyncHandler(async (req, res) => {
        const result = await forgotPassword(req.body.email);
        res.status(200).json({
            success: true,
            message: 'If the email exists, a password reset link has been sent',
            data: result,
        });
    })
);

router.post(
    '/reset-password/:token',
    authLimiter,
    body('password').isLength({ min: 8 }),
    validate,
    asyncHandler(async (req, res) => {
        const result = await resetPassword(req.params.token, req.body);
        res.status(200).json({
            success: true,
            message: 'Password reset successful',
            data: result,
        });
    })
);

router.get(
    '/verify-email/:token',
    asyncHandler(async (req, res) => {
        const result = await verifyEmail(req.params.token);
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: result,
        });
    })
);

// Protected routes
router.use(authenticate);

router.get(
    '/me',
    asyncHandler(async (req: AuthRequest, res) => {
        const user = await getCurrentUser(req.user!.id);
        res.status(200).json({
            success: true,
            data: user,
        });
    })
);

router.patch(
    '/profile',
    body('fullName').optional().trim().isLength({ min: 2 }),
    body('avatarUrl').optional().isURL(),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const user = await updateProfile(req.user!.id, req.body);
        res.status(200).json({
            success: true,
            data: user,
        });
    })
);

router.patch(
    '/password',
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }),
    validate,
    asyncHandler(async (req: AuthRequest, res) => {
        const result = await changePassword(
            req.user!.id,
            req.body.currentPassword,
            req.body.newPassword
        );
        res.status(200).json({
            success: true,
            message: 'Password changed successfully. Please login again.',
            data: result,
        });
    })
);

router.delete(
    '/account',
    asyncHandler(async (req: AuthRequest, res) => {
        await deleteAccount(req.user!.id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    })
);

router.post(
    '/logout',
    asyncHandler(async (req: AuthRequest, res) => {
        const refreshTokenCookie = req.cookies.refreshToken;

        if (refreshTokenCookie) {
            await logout(refreshTokenCookie);
            res.clearCookie('refreshToken');
        }

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    })
);

export default router;

import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { db } from '../../config/db';
import { users } from '../../db/schema';
import { createTokenPair } from './auth.service';
import { asyncHandler } from '../../middleware/asyncHandler';
import AppError from '../../utils/AppError';

const router = Router();

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    asyncHandler(async (req, res) => {
        // User is authenticated, create or update user in database
        const googleUser = req.user as any;

        // Check if user exists with this Google ID
        let user = await db.query.users.findFirst({
            where: eq(users.googleId, googleUser.googleId),
        });

        if (user) {
            // Update last login
            await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
        } else {
            // Check if email already exists
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, googleUser.email),
            });

            if (existingUser) {
                // Link Google account to existing user
                user = existingUser;
                await db
                    .update(users)
                    .set({
                        googleId: googleUser.googleId,
                        avatarUrl: googleUser.avatarUrl || existingUser.avatarUrl,
                        lastLoginAt: new Date(),
                    })
                    .where(eq(users.id, existingUser.id));
            } else {
                // Create new user
                const [newUser] = await db
                    .insert(users)
                    .values({
                        email: googleUser.email,
                        fullName: googleUser.fullName,
                        avatarUrl: googleUser.avatarUrl,
                        googleId: googleUser.googleId,
                        isVerified: true, // Google verified emails are trusted
                    })
                    .returning();
                user = newUser;
            }
        }

        // Create token pair
        const tokens = await createTokenPair(user.id);

        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Redirect to frontend with access token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${tokens.accessToken}`);
    })
);

export default router;

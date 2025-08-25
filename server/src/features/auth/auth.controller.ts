import { eq, and } from 'drizzle-orm';
import { db } from '../../config/db';
import { users, refreshTokens, workspaceMembers, workspaces } from '../../db/schema';
import AppError from '../../utils/AppError';
import { generateRandomToken, hashToken } from '../../utils/crypto';
import { sendEmail } from '../../config/nodemailer';
import {
    hashPassword,
    comparePassword,
    createTokenPair,
    rotateRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
} from './auth.service';
import type { RegisterInput, ResetPasswordInput } from './auth.schema';

const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

export const register = async (data: RegisterInput) => {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, data.email),
    });

    if (existingUser) {
        throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Generate verification token
    const verificationToken = generateRandomToken();

    // Create user
    const [newUser] = await db
        .insert(users)
        .values({
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            verificationToken,
            isVerified: false,
        })
        .returning();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await sendEmail({
        to: data.email,
        subject: 'Verify your email - TaskFlow',
        html: `
      <h1>Welcome to TaskFlow!</h1>
      <p>Hi ${data.fullName},</p>
      <p>Thank you for registering. Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `,
    });

    // Create token pair
    const tokens = await createTokenPair(newUser.id);

    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            avatarUrl: newUser.avatarUrl,
            isVerified: newUser.isVerified,
        },
        ...tokens,
    };
};

export const login = async (email: string, password: string) => {
    // Find user
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user || !user.passwordHash) {
        throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
    }

    // Check if email is verified
    if (!user.isVerified) {
        throw new AppError('Please verify your email before logging in', 401);
    }

    // Update last login
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Create token pair
    const tokens = await createTokenPair(user.id);

    return {
        user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
        },
        ...tokens,
    };
};

export const logout = async (refreshToken: string) => {
    await revokeRefreshToken(refreshToken);
};

export const refreshToken = async (oldRefreshToken: string) => {
    return await rotateRefreshToken(oldRefreshToken);
};

export const forgotPassword = async (email: string) => {
    const user = await db.query.users.findFirst({
        where: eq(users.email, email),
    });

    if (!user) {
        // Don't reveal if email exists
        return { success: true };
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    const resetTokenHash = hashToken(resetToken);
    const resetTokenExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    // Save reset token
    await db
        .update(users)
        .set({
            resetToken: resetTokenHash,
            resetTokenExpires,
        })
        .where(eq(users.id, user.id));

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
        to: email,
        subject: 'Password Reset - TaskFlow',
        html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.fullName},</p>
      <p>You requested to reset your password. Click the link below to set a new password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    `,
    });

    return { success: true };
};

export const resetPassword = async (token: string, data: ResetPasswordInput) => {
    // Hash the token to compare with stored hash
    const resetTokenHash = hashToken(token);

    // Find user with valid reset token
    const user = await db.query.users.findFirst({
        where: and(
            eq(users.resetToken, resetTokenHash),
            eq(users.resetTokenExpires, new Date(Date.now())),
        ),
    });

    if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(data.password);

    // Update user password and clear reset tokens
    await db
        .update(users)
        .set({
            passwordHash,
            resetToken: null,
            resetTokenExpires: null,
        })
        .where(eq(users.id, user.id));

    // Revoke all refresh tokens
    await revokeAllUserTokens(user.id);

    return { success: true };
};

export const verifyEmail = async (token: string) => {
    const user = await db.query.users.findFirst({
        where: eq(users.verificationToken, token),
    });

    if (!user) {
        throw new AppError('Invalid verification token', 400);
    }

    // Mark user as verified
    await db
        .update(users)
        .set({
            isVerified: true,
            verificationToken: null,
        })
        .where(eq(users.id, user.id));

    return { success: true };
};

export const getCurrentUser = async (userId: string) => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        lastLoginAt: user.lastLoginAt,
    };
};

export const updateProfile = async (
    userId: string,
    data: { fullName?: string; avatarUrl?: string }
) => {
    const [updatedUser] = await db
        .update(users)
        .set(data)
        .where(eq(users.id, userId))
        .returning();

    return updatedUser;
};

export const changePassword = async (
    userId: string,
    currentPassword: string,
    newPassword: string
) => {
    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
    });

    if (!user || !user.passwordHash) {
        throw new AppError('User not found', 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

    // Revoke all refresh tokens
    await revokeAllUserTokens(userId);

    return { success: true };
};

export const deleteAccount = async (userId: string) => {
    // Delete user (cascade will handle related records)
    await db.delete(users).where(eq(users.id, userId));
};

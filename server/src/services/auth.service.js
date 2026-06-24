import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import {
  signAccessToken,
  generateRefreshTokenValue,
  getRefreshTokenExpiry,
} from '../lib/jwt.js';
import { generateSecureToken, hashToken } from '../lib/crypto.js';
import { sendPasswordResetEmail } from './email.service.js';
import env from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { sanitizeUser } from '../utils/response.js';

const SALT_ROUNDS = 12;

export class AuthService {
  async register({ email, password, firstName, lastName }) {
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
    });

    await this._assignDefaultSubscription(user.id);

    const tokens = await this._issueTokens(user, {});
    return { user: sanitizeUser(user), ...tokens };
  }

  async login({ email, password }, meta = {}) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this._issueTokens(user, meta);
    return { user: sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken) {
    const session = await prisma.userSession.findFirst({
      where: {
        refreshToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!session || session.user.deletedAt) {
      throw AppError.unauthorized('Session expired or revoked');
    }

    await prisma.userSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const tokens = await this._issueTokens(session.user, {
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
    });

    return { user: sanitizeUser(session.user), ...tokens };
  }

  async logout(refreshToken) {
    await prisma.userSession.updateMany({
      where: { refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId) {
    await prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async forgotPassword(email) {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const rawToken = generateSecureToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(
      Date.now() + env.PASSWORD_RESET_EXPIRES_HOURS * 60 * 60 * 1000,
    );

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    const response = { message: 'If an account exists, a reset link has been sent' };

    if (!env.isProduction) {
      response.devResetToken = rawToken;
      response.devResetUrl = resetUrl;
    }

    return response;
  }

  async resetPassword({ token, password }) {
    const tokenHash = hashToken(token);

    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.user.deletedAt) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.userSession.updateMany({
        where: { userId: resetRecord.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) throw AppError.notFound('User');

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  }

  async getProfile(userId) {
    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) throw AppError.notFound('User');
    return sanitizeUser(user);
  }

  async _issueTokens(user, { userAgent, ipAddress } = {}) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = generateRefreshTokenValue();

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshToken,
        userAgent,
        ipAddress,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    };
  }

  async _assignDefaultSubscription(userId) {
    const essencePlan = await prisma.subscriptionPlan.findFirst({
      where: { slug: 'essence', isActive: true },
    });

    if (!essencePlan) return;

    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: ['trialing', 'active', 'past_due'] },
      },
    });

    if (existing) return;

    await prisma.subscription.create({
      data: {
        userId,
        planId: essencePlan.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }
}

export default new AuthService();

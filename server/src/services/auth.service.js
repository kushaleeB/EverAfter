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
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

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

  async loginWithGoogle({ accessToken }, meta = {}) {
    if (!env.GOOGLE_CLIENT_ID) {
      throw AppError.badRequest('Google sign-in is not configured');
    }

    const profile = await this._fetchGoogleProfile(accessToken);
    if (!profile?.sub || !profile.email) {
      throw AppError.unauthorized('Unable to verify Google account');
    }

    const email = profile.email.toLowerCase();
    const firstName = profile.given_name?.trim() || profile.name?.split(' ')[0] || 'Guest';
    const lastName =
      profile.family_name?.trim() ||
      profile.name?.split(' ').slice(1).join(' ') ||
      'User';
    const avatarUrl = profile.picture ?? null;

    let user = await prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ googleId: profile.sub }, { email }],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? profile.sub,
          avatarUrl: user.avatarUrl ?? avatarUrl,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
          lastLoginAt: new Date(),
          firstName: user.firstName || firstName,
          lastName: user.lastName || lastName,
        },
      });
    } else {
      const passwordHash = await bcrypt.hash(generateSecureToken(), SALT_ROUNDS);
      user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          googleId: profile.sub,
          firstName,
          lastName,
          avatarUrl,
          emailVerifiedAt: profile.email_verified ? new Date() : null,
          lastLoginAt: new Date(),
        },
      });
      await this._assignDefaultSubscription(user.id);
    }

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

  async _fetchGoogleProfile(accessToken) {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw AppError.unauthorized('Invalid Google access token');
    }

    return response.json();
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

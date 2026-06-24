import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import env from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export function generateRefreshTokenValue() {
  return randomBytes(48).toString('hex');
}

export function getRefreshTokenExpiry() {
  const days = parseInt(env.JWT_REFRESH_EXPIRES_IN, 10) || 7;
  const unit = env.JWT_REFRESH_EXPIRES_IN.replace(/\d/g, '');
  const multiplier = unit === 'd' ? 86400000 : unit === 'h' ? 3600000 : 86400000;
  return new Date(Date.now() + days * multiplier);
}

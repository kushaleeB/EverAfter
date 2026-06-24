import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export function generateSecureToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

export function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

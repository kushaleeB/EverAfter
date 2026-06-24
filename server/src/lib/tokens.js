import { randomBytes } from 'crypto';

export function generateAccessToken() {
  return randomBytes(32).toString('hex');
}

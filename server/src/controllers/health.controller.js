import prisma from '../lib/prisma.js';
import { sendSuccess } from '../utils/response.js';

export const health = (_req, res) => {
  sendSuccess(res, { status: 'ok', service: 'everafter-api', version: 'v1' });
};

export const healthDb = async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  sendSuccess(res, { status: 'ok', database: 'connected' });
};

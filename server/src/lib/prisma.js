import { PrismaClient } from '@prisma/client';
import env from '../config/env.js';

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProduction ? ['error'] : ['query', 'error', 'warn'],
  });

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

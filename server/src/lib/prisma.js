import { PrismaClient } from '@prisma/client';
import env from '../config/env.js';

const globalForPrisma = globalThis;

const prismaOptions = {
  log: env.isProduction ? ['error'] : ['query', 'error', 'warn'],
};

if (env.databaseUrl) {
  prismaOptions.datasources = { db: { url: env.databaseUrl } };
}

const prisma =
  globalForPrisma.prisma ?? new PrismaClient(prismaOptions);

if (!env.isProduction) {
  globalForPrisma.prisma = prisma;
}

export default prisma;

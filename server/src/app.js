import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import env from './config/env.js';
import { requestId } from './middleware/requestId.middleware.js';
import { globalRateLimiter } from './middleware/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import v1Routes from './api/v1/routes/index.js';

const app = express();

app.set('trust proxy', 1);

app.use(requestId);
  app.use(helmet({
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));
app.use(compression());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }),
);
app.use(globalRateLimiter);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (!env.isProduction) {
  app.use(morgan('dev'));
}

app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

app.use('/api/v1', v1Routes);

app.use('/api/health', (_req, res) => {
  res.redirect(308, '/api/v1/health');
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

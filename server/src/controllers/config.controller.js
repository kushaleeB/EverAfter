import env from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

export const getPublicConfig = (_req, res) => {
  sendSuccess(res, {
    googleClientId: env.GOOGLE_CLIENT_ID ?? null,
  });
};

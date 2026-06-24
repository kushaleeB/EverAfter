import templateService from '../services/template.service.js';
import { sendSuccess } from '../utils/response.js';

export const list = async (_req, res) => {
  const templates = await templateService.listActive();
  sendSuccess(res, templates);
};

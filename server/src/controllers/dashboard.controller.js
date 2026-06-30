import dashboardService from '../services/dashboard.service.js';
import { sendSuccess } from '../utils/response.js';

export const summary = async (req, res) => {
  const data = await dashboardService.getSummary(req.user.id);
  sendSuccess(res, data);
};

import authService from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';

export const register = async (req, res) => {
  const result = await authService.register(req.body);
  sendCreated(res, result);
};

export const login = async (req, res) => {
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const result = await authService.login(req.body, meta);
  sendSuccess(res, result);
};

export const googleLogin = async (req, res) => {
  const meta = {
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  };
  const result = await authService.loginWithGoogle(req.body, meta);
  sendSuccess(res, result);
};

export const refresh = async (req, res) => {
  const result = await authService.refresh(req.body.refreshToken);
  sendSuccess(res, result);
};

export const logout = async (req, res) => {
  await authService.logout(req.body.refreshToken);
  sendNoContent(res);
};

export const logoutAll = async (req, res) => {
  await authService.logoutAll(req.user.id);
  sendNoContent(res);
};

export const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  sendSuccess(res, result);
};

export const resetPassword = async (req, res) => {
  const result = await authService.resetPassword(req.body);
  sendSuccess(res, result);
};

export const changePassword = async (req, res) => {
  const result = await authService.changePassword(req.user.id, req.body);
  sendSuccess(res, result);
};

export const me = async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  sendSuccess(res, user);
};

export const updateProfile = async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  sendSuccess(res, user);
};

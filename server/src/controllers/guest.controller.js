import guestService from '../services/guest.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';

export const list = async (req, res) => {
  const result = await guestService.list(req.params.eventId, req.query);
  sendSuccess(res, result.items, 200, result.meta);
};

export const get = async (req, res) => {
  const guest = await guestService.getById(req.params.eventId, req.params.guestId);
  sendSuccess(res, guest);
};

export const create = async (req, res) => {
  const guest = await guestService.create(req.params.eventId, req.body);
  sendCreated(res, guest);
};

export const update = async (req, res) => {
  const guest = await guestService.update(
    req.params.eventId,
    req.params.guestId,
    req.body,
  );
  sendSuccess(res, guest);
};

export const remove = async (req, res) => {
  await guestService.remove(req.params.eventId, req.params.guestId);
  sendNoContent(res);
};

export const importCsv = async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'CSV file is required' },
    });
  }

  const result = await guestService.importCsv(req.params.eventId, req.file.buffer);
  sendCreated(res, result);
};

export const listCategories = async (_req, res) => {
  sendSuccess(res, guestService.getCategories());
};

export const rsvpSummary = async (req, res) => {
  const summary = await guestService.getRsvpSummary(req.params.eventId);
  sendSuccess(res, summary);
};

export const rsvpTracking = async (req, res) => {
  const result = await guestService.getRsvpTracking(req.params.eventId, req.query);
  sendSuccess(res, result.guests, 200, result.meta);
};

export const generateQr = async (req, res) => {
  const result = await guestService.generateQr(
    req.params.eventId,
    req.params.guestId,
    req.query,
  );

  if (result.contentType === 'image/png') {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="guest-${req.params.guestId}-qr.png"`);
    return res.send(result.buffer);
  }

  sendSuccess(res, result);
};

export const markInviteSent = async (req, res) => {
  const guest = await guestService.markInviteSent(req.params.eventId, req.params.guestId);
  sendSuccess(res, guest);
};

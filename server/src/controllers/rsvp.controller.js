import rsvpService from '../services/rsvp.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

// ─── Public ──────────────────────────────────────────────────────────────────

export const getPublicPage = async (req, res) => {
  const token = req.query.token || req.query.accessToken;
  const page = await rsvpService.getPublicPage(req.params.slug, token);
  if (token) {
    res.setHeader('Cache-Control', 'no-store, private');
  }
  sendSuccess(res, page);
};

export const getGuestRsvp = async (req, res) => {
  const accessToken = req.query.accessToken || req.query.token;
  const result = await rsvpService.getGuestRsvp(req.params.slug, accessToken);
  res.setHeader('Cache-Control', 'no-store, private');
  sendSuccess(res, result);
};

export const getPublicGuestQr = async (req, res) => {
  const accessToken = req.query.accessToken || req.query.token;
  const result = await rsvpService.getPublicGuestQr(req.params.slug, accessToken);
  res.setHeader('Cache-Control', 'no-store, private');
  res.setHeader('Pragma', 'no-cache');
  sendSuccess(res, result);
};

export const submitRsvp = async (req, res) => {
  const result = await rsvpService.submitRsvp(req.params.slug, req.body, {
    ipAddress: req.ip,
  });
  sendCreated(res, result);
};

export const updateGuestRsvp = async (req, res) => {
  const result = await rsvpService.updateGuestRsvp(req.params.slug, req.body, {
    ipAddress: req.ip,
  });
  sendSuccess(res, result);
};

// ─── Authenticated ───────────────────────────────────────────────────────────

export const list = async (req, res) => {
  const result = await rsvpService.listForEvent(req.params.eventId, req.query);
  sendSuccess(res, result.items, 200, result.meta);
};

export const updateByHost = async (req, res) => {
  const rsvp = await rsvpService.updateByHost(
    req.params.eventId,
    req.params.rsvpId,
    req.body,
  );
  sendSuccess(res, rsvp);
};

export const eventAnalytics = async (req, res) => {
  const analytics = await rsvpService.getEventAnalytics(req.params.eventId);
  sendSuccess(res, analytics);
};

export const invitationAnalytics = async (req, res) => {
  const analytics = await rsvpService.getInvitationAnalytics(
    req.params.eventId,
    req.params.invitationId,
  );
  sendSuccess(res, analytics);
};

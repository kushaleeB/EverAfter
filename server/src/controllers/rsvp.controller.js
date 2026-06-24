import rsvpService from '../services/rsvp.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

// ─── Public ──────────────────────────────────────────────────────────────────

export const getPublicPage = async (req, res) => {
  const token = req.query.token || req.query.accessToken;
  const page = await rsvpService.getPublicPage(req.params.slug, token);
  sendSuccess(res, page);
};

export const getGuestRsvp = async (req, res) => {
  const result = await rsvpService.getGuestRsvp(
    req.params.slug,
    req.query.accessToken,
  );
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

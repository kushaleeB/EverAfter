import invitationService from '../services/invitation.service.js';
import rsvpService from '../services/rsvp.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';

// ─── Invitations CRUD ────────────────────────────────────────────────────────

export const list = async (req, res) => {
  const result = await invitationService.list(req.params.eventId, req.query);
  sendSuccess(res, result.items, 200, result.meta);
};

export const get = async (req, res) => {
  const invitation = await invitationService.getById(
    req.params.eventId,
    req.params.invitationId,
  );
  sendSuccess(res, invitation);
};

export const getPublic = async (req, res) => {
  const invitation = await invitationService.getPublicBySlug(req.params.slug);
  sendSuccess(res, invitation);
};

export const create = async (req, res) => {
  const invitation = await invitationService.create(req.params.eventId, req.body);
  sendCreated(res, invitation);
};

export const update = async (req, res) => {
  const invitation = await invitationService.update(
    req.params.eventId,
    req.params.invitationId,
    req.body,
  );
  sendSuccess(res, invitation);
};

export const publish = async (req, res) => {
  const invitation = await invitationService.publish(
    req.params.eventId,
    req.params.invitationId,
  );
  sendSuccess(res, invitation);
};

export const archive = async (req, res) => {
  const invitation = await invitationService.archive(
    req.params.eventId,
    req.params.invitationId,
  );
  sendSuccess(res, invitation);
};

export const remove = async (req, res) => {
  await invitationService.remove(req.params.eventId, req.params.invitationId);
  sendNoContent(res);
};

// ─── Sections CRUD ───────────────────────────────────────────────────────────

export const listSections = async (req, res) => {
  const sections = await invitationService.listSections(
    req.params.eventId,
    req.params.invitationId,
  );
  sendSuccess(res, sections);
};

export const createSection = async (req, res) => {
  const section = await invitationService.createSection(
    req.params.eventId,
    req.params.invitationId,
    req.body,
  );
  sendCreated(res, section);
};

export const updateSection = async (req, res) => {
  const section = await invitationService.updateSection(
    req.params.eventId,
    req.params.invitationId,
    req.params.sectionId,
    req.body,
  );
  sendSuccess(res, section);
};

export const removeSection = async (req, res) => {
  await invitationService.removeSection(
    req.params.eventId,
    req.params.invitationId,
    req.params.sectionId,
  );
  sendNoContent(res);
};

export const reorderSections = async (req, res) => {
  const sections = await invitationService.reorderSections(
    req.params.eventId,
    req.params.invitationId,
    req.body.orderedIds,
  );
  sendSuccess(res, sections);
};

export const rsvpAnalytics = async (req, res) => {
  const analytics = await rsvpService.getInvitationAnalytics(
    req.params.eventId,
    req.params.invitationId,
  );
  sendSuccess(res, analytics);
};

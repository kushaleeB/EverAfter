import eventService from '../services/event.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';

export const list = async (req, res) => {
  const events = await eventService.listForUser(req.user.id);
  sendSuccess(res, events);
};

export const get = async (req, res) => {
  const event = await eventService.getById(req.params.eventId);
  sendSuccess(res, event);
};

export const create = async (req, res) => {
  const event = await eventService.create(req.user.id, req.body);
  sendCreated(res, event);
};

export const update = async (req, res) => {
  const event = await eventService.update(req.params.eventId, req.user.id, req.body);
  sendSuccess(res, event);
};

export const remove = async (req, res) => {
  await eventService.softDelete(req.params.eventId, req.user.id);
  sendNoContent(res);
};

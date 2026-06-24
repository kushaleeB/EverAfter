import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';

export class EventService {
  async listForUser(userId) {
    const owned = await prisma.event.findMany({
      where: { ownerId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    const collaborated = await prisma.eventCollaborator.findMany({
      where: { userId, acceptedAt: { not: null } },
      include: { event: true },
    });

    const collabEvents = collaborated
      .map((c) => c.event)
      .filter((e) => e && !e.deletedAt);

    const seen = new Set(owned.map((e) => e.id));
    const merged = [
      ...owned,
      ...collabEvents.filter((e) => !seen.has(e.id)),
    ];

    return merged;
  }

  async getById(eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        invitations: { where: { deletedAt: null } },
        _count: { select: { guests: true } },
      },
    });
    if (!event) throw AppError.notFound('Event');
    return event;
  }

  async create(userId, data) {
    return prisma.event.create({
      data: {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
        ownerId: userId,
      },
    });
  }

  async update(eventId, userId, data) {
    await this.getById(eventId);
    return prisma.event.update({
      where: { id: eventId },
      data: {
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
      },
    });
  }

  async softDelete(eventId, userId) {
    await this.getById(eventId);
    return prisma.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });
  }
}

export default new EventService();

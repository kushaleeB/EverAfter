import prisma from '../lib/prisma.js';

export class InvitationSectionRepository {
  constructor(db = prisma) {
    this.db = db;
  }

  async findByInvitation(invitationId) {
    return this.db.invitationSection.findMany({
      where: { invitationId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findById(sectionId, invitationId) {
    return this.db.invitationSection.findFirst({
      where: { id: sectionId, invitationId, deletedAt: null },
    });
  }

  async getNextSortOrder(invitationId) {
    const last = await this.db.invitationSection.findFirst({
      where: { invitationId, deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    return (last?.sortOrder ?? -1) + 1;
  }

  async create(data) {
    return this.db.invitationSection.create({ data });
  }

  async update(sectionId, data) {
    return this.db.invitationSection.update({
      where: { id: sectionId },
      data,
    });
  }

  async softDelete(sectionId) {
    return this.db.invitationSection.update({
      where: { id: sectionId },
      data: { deletedAt: new Date() },
    });
  }

  async reorder(invitationId, orderedIds) {
    const updates = orderedIds.map((id, index) =>
      this.db.invitationSection.updateMany({
        where: { id, invitationId, deletedAt: null },
        data: { sortOrder: index },
      }),
    );
    return this.db.$transaction(updates);
  }
}

export default new InvitationSectionRepository();

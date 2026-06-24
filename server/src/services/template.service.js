import prisma from '../lib/prisma.js';

export class TemplateService {
  async listActive() {
    return prisma.invitationTemplate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        previewImageUrl: true,
        isPremium: true,
        minPlanSlug: true,
        themeConfig: true,
      },
    });
  }

  async getBySlug(slug) {
    return prisma.invitationTemplate.findFirst({
      where: { slug, isActive: true },
    });
  }
}

export default new TemplateService();

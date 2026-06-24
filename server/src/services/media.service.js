import path from 'path';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import env from '../config/env.js';

const MIME_TO_TYPE = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'application/pdf': 'document',
};

export class MediaService {
  async listByEvent(eventId) {
    return prisma.mediaAsset.findMany({
      where: { eventId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upload(eventId, userId, file, invitationId = null) {
    const storageKey = `events/${eventId}/${file.filename}`;
    const fileUrl = `/uploads/${file.filename}`;

    return prisma.mediaAsset.create({
      data: {
        eventId,
        uploadedBy: userId,
        invitationId,
        fileName: file.originalname,
        fileUrl,
        storageKey,
        mimeType: file.mimetype,
        assetType: MIME_TO_TYPE[file.mimetype] ?? 'document',
        fileSizeBytes: BigInt(file.size),
      },
    });
  }

  async softDelete(mediaId, eventId, userId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: mediaId, eventId, deletedAt: null },
    });
    if (!asset) throw AppError.notFound('Media asset');

    return prisma.mediaAsset.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });
  }

  getAbsolutePath(filename) {
    return path.resolve(process.cwd(), env.UPLOAD_DIR, filename);
  }
}

export default new MediaService();

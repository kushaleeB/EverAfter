import path from 'path';
import { mkdirSync, writeFileSync, unlinkSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma.js';
import { AppError } from '../errors/AppError.js';
import env from '../config/env.js';
import { serializeMediaAsset } from '../utils/serialize.js';
import {
  deleteObject,
  isStorageConfigured,
  shouldUseSupabaseStorage,
  uploadObject,
} from '../lib/supabaseStorage.js';

const MIME_TO_TYPE = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'application/pdf': 'document',
};

function buildStorageKey(eventId, filename) {
  return `events/${eventId}/${filename}`;
}

function saveLocalFile(filename, buffer) {
  const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
  mkdirSync(uploadDir, { recursive: true });
  const absolutePath = path.join(uploadDir, filename);
  writeFileSync(absolutePath, buffer);
  return `/uploads/${filename}`;
}

export class MediaService {
  async listByEvent(eventId) {
    const assets = await prisma.mediaAsset.findMany({
      where: { eventId, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
    return serializeMediaAsset(assets);
  }

  async upload(eventId, userId, file, invitationId = null) {
    if (!file?.buffer) {
      throw AppError.badRequest('No file data received');
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const storageKey = buildStorageKey(eventId, filename);

    let fileUrl;
    if (shouldUseSupabaseStorage()) {
      fileUrl = await uploadObject(storageKey, file.buffer, file.mimetype);
    } else {
      fileUrl = saveLocalFile(filename, file.buffer);
    }

    const asset = await prisma.mediaAsset.create({
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
    return serializeMediaAsset(asset);
  }

  async softDelete(mediaId, eventId, userId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: { id: mediaId, eventId, deletedAt: null },
    });
    if (!asset) throw AppError.notFound('Media asset');

    if (asset.fileUrl?.startsWith('/uploads/')) {
      const filename = path.basename(asset.fileUrl);
      try {
        unlinkSync(path.resolve(process.cwd(), env.UPLOAD_DIR, filename));
      } catch {
        // File may already be gone locally.
      }
    } else if (asset.storageKey && isStorageConfigured()) {
      await deleteObject(asset.storageKey);
    }

    return prisma.mediaAsset.update({
      where: { id: mediaId },
      data: { deletedAt: new Date() },
    });
  }
}

export default new MediaService();

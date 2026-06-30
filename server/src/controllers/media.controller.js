import mediaService from '../services/media.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';

function toMediaAssetResponse(asset) {
  return {
    id: asset.id,
    fileUrl: asset.fileUrl,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
  };
}

export const list = async (req, res) => {
  const assets = await mediaService.listByEvent(req.params.eventId);
  sendSuccess(res, assets.map(toMediaAssetResponse));
};

export const upload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
  }
  const asset = await mediaService.upload(
    req.params.eventId,
    req.user.id,
    req.file,
    req.body.invitationId,
  );
  sendCreated(res, toMediaAssetResponse(asset));
};

export const remove = async (req, res) => {
  await mediaService.softDelete(req.params.mediaId, req.params.eventId, req.user.id);
  sendNoContent(res);
};

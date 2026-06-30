/**
 * Serialize Prisma invitation records for JSON responses (BigInt → string).
 */
export function serializeInvitation(invitation) {
  if (!invitation) return invitation;

  if (Array.isArray(invitation)) {
    return invitation.map(serializeInvitation);
  }

  const serialized = { ...invitation };

  if (typeof serialized.viewCount === 'bigint') {
    serialized.viewCount = serialized.viewCount.toString();
  }

  if (serialized.sections) {
    serialized.sections = serialized.sections.map((s) => ({ ...s }));
  }

  return serialized;
}

/**
 * Serialize Prisma media asset records for JSON responses (BigInt → number).
 */
export function serializeMediaAsset(asset) {
  if (!asset) return asset;

  if (Array.isArray(asset)) {
    return asset.map(serializeMediaAsset);
  }

  const serialized = { ...asset };

  if (typeof serialized.fileSizeBytes === 'bigint') {
    serialized.fileSizeBytes = Number(serialized.fileSizeBytes);
  }

  return serialized;
}

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

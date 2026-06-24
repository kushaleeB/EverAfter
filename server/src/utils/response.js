export function sendSuccess(res, data, statusCode = 200, meta = undefined) {
  const body = { success: true, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}

export function sendCreated(res, data) {
  return sendSuccess(res, data, 201);
}

export function sendNoContent(res) {
  return res.status(204).send();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, deletedAt, ...safe } = user;
  return {
    id: safe.id,
    email: safe.email,
    firstName: safe.firstName,
    lastName: safe.lastName,
    avatarUrl: safe.avatarUrl,
    role: safe.role,
    emailVerifiedAt: safe.emailVerifiedAt,
    createdAt: safe.createdAt,
  };
}

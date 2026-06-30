function toJsonSafe(value) {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map(toJsonSafe);
  }

  if (value !== null && typeof value === 'object') {
    if (value instanceof Date) {
      return value;
    }

    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, toJsonSafe(entry)]));
  }

  return value;
}

export function sendSuccess(res, data, statusCode = 200, meta = undefined) {
  const body = { success: true, data: toJsonSafe(data) };
  if (meta) body.meta = toJsonSafe(meta);
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

import { randomBytes } from 'crypto';

const SLUG_REGEX = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function randomSuffix(length = 3) {
  return randomBytes(length).toString('hex').toUpperCase();
}

export async function generateUniqueSlug(baseText, slugExists) {
  const base = slugify(baseText) || 'invitation';

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = randomSuffix();
    const candidate = `${base}-${suffix}`.slice(0, 100);
    if (SLUG_REGEX.test(candidate) && !(await slugExists(candidate))) {
      return candidate;
    }
  }

  const fallback = `${base}-${Date.now().toString(36)}`.slice(0, 100);
  if (!(await slugExists(fallback))) return fallback;
  throw new Error('Unable to generate a unique invitation slug');
}

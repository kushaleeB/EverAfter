import { parse } from 'csv-parse/sync';
import { AppError } from '../errors/AppError.js';

const GUEST_CATEGORIES = new Set([
  'family',
  'friends',
  'colleagues',
  'vip',
  'wedding_party',
  'other',
]);

const HEADER_ALIASES = {
  firstname: 'firstName',
  first_name: 'firstName',
  'first name': 'firstName',
  lastname: 'lastName',
  last_name: 'lastName',
  'last name': 'lastName',
  email: 'email',
  partysize: 'partySize',
  party_size: 'partySize',
  'party size': 'partySize',
  category: 'category',
  plusoneallowed: 'plusOneAllowed',
  plus_one_allowed: 'plusOneAllowed',
  'plus one': 'plusOneAllowed',
  notes: 'notes',
};

function normalizeHeader(header) {
  return HEADER_ALIASES[header.trim().toLowerCase()] ?? header.trim();
}

function parseBool(value) {
  if (value === undefined || value === null || value === '') return false;
  const v = String(value).trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes' || v === 'y';
}

function parseCategory(value) {
  const cat = String(value || 'other').trim().toLowerCase().replace(/\s+/g, '_');
  if (cat === 'wedding_party' || cat === 'weddingparty' || cat === 'bridal_party') {
    return 'wedding_party';
  }
  return GUEST_CATEGORIES.has(cat) ? cat : 'other';
}

/**
 * Parse CSV buffer into validated guest rows.
 * Expected headers: firstName, lastName, email (optional), partySize, category, plusOneAllowed, notes
 */
export function parseGuestCsv(buffer) {
  if (!buffer?.length) {
    throw AppError.badRequest('CSV file is empty');
  }

  let records;
  try {
    records = parse(buffer, {
      columns: (headers) => headers.map(normalizeHeader),
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    });
  } catch {
    throw AppError.badRequest('Invalid CSV format');
  }

  if (!records.length) {
    throw AppError.badRequest('CSV contains no data rows');
  }

  if (records.length > 500) {
    throw AppError.badRequest('CSV import limited to 500 guests per upload');
  }

  const guests = [];
  const errors = [];

  records.forEach((row, index) => {
    const line = index + 2;
    const firstName = row.firstName?.trim();
    const lastName = row.lastName?.trim();

    if (!firstName || !lastName) {
      errors.push({ line, message: 'firstName and lastName are required' });
      return;
    }

    const partySize = parseInt(row.partySize, 10);
    if (row.partySize && (Number.isNaN(partySize) || partySize < 1 || partySize > 20)) {
      errors.push({ line, message: 'partySize must be between 1 and 20' });
      return;
    }

    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
      errors.push({ line, message: 'Invalid email format' });
      return;
    }

    guests.push({
      firstName,
      lastName,
      email: row.email?.trim().toLowerCase() || undefined,
      partySize: partySize || 1,
      category: parseCategory(row.category),
      plusOneAllowed: parseBool(row.plusOneAllowed),
      notes: row.notes?.trim() || undefined,
    });
  });

  if (errors.length) {
    throw AppError.badRequest('CSV validation failed', errors);
  }

  return guests;
}

export const GUEST_CATEGORY_LABELS = {
  family: 'Family',
  friends: 'Friends',
  colleagues: 'Colleagues',
  vip: 'VIP',
  wedding_party: 'Wedding Party',
  other: 'Other',
};

-- Add guest categories for wedding guest management
-- Safe to run multiple times

DO $$ BEGIN
  CREATE TYPE guest_category AS ENUM (
    'family',
    'friends',
    'colleagues',
    'vip',
    'wedding_party',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS category guest_category NOT NULL DEFAULT 'other';

CREATE INDEX IF NOT EXISTS idx_guests_category
  ON guests (event_id, category) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_guests_rsvp_lookup
  ON guests (event_id) WHERE deleted_at IS NULL;

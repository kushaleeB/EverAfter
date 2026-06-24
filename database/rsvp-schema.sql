-- =============================================================================
-- EverAfter — RSVP System Schema
-- =============================================================================

CREATE TYPE rsvp_status AS ENUM ('pending', 'attending', 'declined', 'maybe');

CREATE TABLE IF NOT EXISTS rsvps (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id          UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  invitation_id     UUID NOT NULL REFERENCES invitations(id) ON DELETE RESTRICT,
  status            rsvp_status NOT NULL DEFAULT 'pending',
  attending_count   INTEGER NOT NULL DEFAULT 0,
  dietary_notes     TEXT,
  message           TEXT,
  responded_at      TIMESTAMPTZ,
  ip_address        INET,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_rsvp_guest_invitation UNIQUE (guest_id, invitation_id),
  CONSTRAINT chk_rsvps_attending_count_non_negative CHECK (attending_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_rsvps_invitation ON rsvps (invitation_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_guest ON rsvps (guest_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_status ON rsvps (invitation_id, status);
CREATE INDEX IF NOT EXISTS idx_rsvps_responded_at ON rsvps (invitation_id, responded_at DESC)
  WHERE responded_at IS NOT NULL;

-- RSVP system enhancements (safe to re-run)
-- ip_address column for audit trail on public submissions

ALTER TABLE rsvps
  ADD COLUMN IF NOT EXISTS ip_address INET;

CREATE INDEX IF NOT EXISTS idx_rsvps_responded_at
  ON rsvps (invitation_id, responded_at DESC)
  WHERE responded_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rsvps_created_at
  ON rsvps (created_at DESC);

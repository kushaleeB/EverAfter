-- Guest invitation delivery tracking
CREATE TYPE guest_invite_status AS ENUM ('not_sent', 'sent', 'opened', 'responded');

ALTER TABLE guests
  ADD COLUMN IF NOT EXISTS invite_status guest_invite_status NOT NULL DEFAULT 'not_sent',
  ADD COLUMN IF NOT EXISTS invite_opened_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

UPDATE guests
SET invite_status = 'sent'
WHERE invite_sent_at IS NOT NULL AND invite_status = 'not_sent';

UPDATE guests g
SET
  invite_status = 'responded',
  responded_at = r.responded_at
FROM (
  SELECT guest_id, MAX(responded_at) AS responded_at
  FROM rsvps
  WHERE responded_at IS NOT NULL
  GROUP BY guest_id
) r
WHERE g.id = r.guest_id;

CREATE INDEX IF NOT EXISTS guests_event_invite_status_idx ON guests (event_id, invite_status);

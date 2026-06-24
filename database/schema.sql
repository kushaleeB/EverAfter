-- =============================================================================
-- EverAfter — Production PostgreSQL Schema
-- Luxury Wedding Invitation SaaS Platform
-- =============================================================================
-- PostgreSQL 15+
-- Tech stack: PostgreSQL · Express.js · React
-- =============================================================================
--
-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │                         ENTITY-RELATIONSHIP DIAGRAM                         │
-- └─────────────────────────────────────────────────────────────────────────────┘
--
--  subscription_plans ─────┐
--                          │ plan_id
--  users ──────────────────┼── subscriptions
--    │                      │
--    ├── user_sessions      │
--    ├── password_reset_tokens
--    │
--    ├── events (weddings) ◄──── event_collaborators ──── users
--    │      │
--    │      ├── invitations ──── invitation_templates
--    │      │       │
--    │      │       └── invitation_sections
--    │      │
--    │      ├── guests ──────── rsvps
--    │      │                      │
--    │      │                      └── invitations
--    │      │
--    │      └── media_assets
--    │
--    └── audit_logs
--
-- Cardinality:
--   users            1 ── *  events
--   users            1 ── *  subscriptions
--   subscription_plans 1 ── * subscriptions
--   events           1 ── *  invitations
--   events           1 ── *  guests
--   events           1 ── *  media_assets
--   events           * ── *  users          (via event_collaborators)
--   invitations      1 ── *  invitation_sections
--   invitations      * ── 1  invitation_templates (optional)
--   guests           1 ── 1  rsvps          (per invitation)
--   invitations      1 ── *  rsvps
--
-- =============================================================================

-- ─── Extensions ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- ─── Enumerations ─────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('customer', 'admin');

CREATE TYPE subscription_status AS ENUM (
  'trialing',
  'active',
  'past_due',
  'canceled',
  'expired'
);

CREATE TYPE billing_interval AS ENUM ('monthly', 'yearly', 'lifetime');

CREATE TYPE invitation_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE section_type AS ENUM (
  'hero',
  'story',
  'schedule',
  'gallery',
  'rsvp',
  'registry',
  'custom'
);

CREATE TYPE guest_role AS ENUM ('host', 'partner', 'planner', 'guest');

CREATE TYPE rsvp_status AS ENUM ('pending', 'attending', 'declined', 'maybe');

CREATE TYPE collaborator_role AS ENUM ('owner', 'partner', 'planner', 'viewer');

CREATE TYPE media_asset_type AS ENUM ('image', 'video', 'document');

CREATE TYPE audit_action AS ENUM ('insert', 'update', 'delete', 'soft_delete', 'restore');

-- ─── Shared Functions ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Hard deletes are disabled on %. Use soft delete (SET deleted_at).', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

-- ─── 1. Users ─────────────────────────────────────────────────────────────────
-- Account holders: couples, planners, administrators.
-- Soft-delete enabled. Email uniqueness enforced among active rows only.

CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  email             CITEXT NOT NULL,
  password_hash     VARCHAR(255) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  avatar_url        TEXT,

  role              user_role NOT NULL DEFAULT 'customer',
  email_verified_at TIMESTAMPTZ,
  last_login_at     TIMESTAMPTZ,

  -- Audit
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Soft delete
  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_users_names_not_blank
    CHECK (length(trim(first_name)) > 0 AND length(trim(last_name)) > 0)
);

CREATE UNIQUE INDEX uq_users_email_active
  ON users (email)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_users_role ON users (role) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_no_hard_delete
  BEFORE DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ─── 2. Subscription Plans ────────────────────────────────────────────────────
-- Catalog of SaaS tiers. Plans are versioned via is_active flag, not soft-deleted.

CREATE TABLE subscription_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name                  VARCHAR(100) NOT NULL,
  slug                  VARCHAR(50) NOT NULL,
  description           TEXT,
  price_cents           INTEGER NOT NULL DEFAULT 0,
  currency              CHAR(3) NOT NULL DEFAULT 'USD',
  billing_interval      billing_interval NOT NULL DEFAULT 'monthly',

  -- Entitlement limits (NULL = unlimited)
  max_invitations       INTEGER,
  max_guests_per_event  INTEGER,
  max_storage_mb        INTEGER,
  max_collaborators     INTEGER DEFAULT 2,

  features              JSONB NOT NULL DEFAULT '[]',
  stripe_price_id       VARCHAR(255),
  sort_order            INTEGER NOT NULL DEFAULT 0,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_plans_price_non_negative CHECK (price_cents >= 0),
  CONSTRAINT chk_plans_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT uq_plans_slug UNIQUE (slug)
);

CREATE INDEX idx_plans_active ON subscription_plans (sort_order) WHERE is_active = TRUE;

CREATE TRIGGER trg_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 3. Subscriptions ─────────────────────────────────────────────────────────
-- One active subscription per user. Historical rows retained for billing audit.

CREATE TABLE subscriptions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plan_id                 UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,

  status                  subscription_status NOT NULL DEFAULT 'trialing',
  stripe_customer_id      VARCHAR(255),
  stripe_subscription_id  VARCHAR(255),

  trial_ends_at           TIMESTAMPTZ,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at               TIMESTAMPTZ,
  canceled_at             TIMESTAMPTZ,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by              UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by              UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX uq_subscriptions_one_active_per_user
  ON subscriptions (user_id)
  WHERE status IN ('trialing', 'active', 'past_due');

CREATE INDEX idx_subscriptions_user ON subscriptions (user_id);
CREATE INDEX idx_subscriptions_plan ON subscriptions (plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions (status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 4. User Sessions ─────────────────────────────────────────────────────────
-- Refresh-token store for JWT rotation. Hard-deleted on logout/expiry.

CREATE TABLE user_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token   VARCHAR(512) NOT NULL,
  user_agent      TEXT,
  ip_address      INET,

  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_sessions_refresh_token UNIQUE (refresh_token)
);

CREATE INDEX idx_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_sessions_expires ON user_sessions (expires_at) WHERE revoked_at IS NULL;

CREATE TRIGGER trg_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 5. Password Reset Tokens ─────────────────────────────────────────────────

CREATE TABLE password_reset_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash      VARCHAR(128) NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  used_at         TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_password_reset_token UNIQUE (token_hash)
);

CREATE INDEX idx_password_reset_user ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens (expires_at)
  WHERE used_at IS NULL;

-- ─── 6. Invitation Templates ──────────────────────────────────────────────────
-- Curated luxury templates. Users select a template when creating an invitation.

CREATE TABLE invitation_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name              VARCHAR(150) NOT NULL,
  slug              VARCHAR(100) NOT NULL,
  description       TEXT,
  preview_image_url TEXT NOT NULL,
  thumbnail_url     TEXT,

  theme_config      JSONB NOT NULL DEFAULT '{}',
  default_sections  JSONB NOT NULL DEFAULT '[]',

  min_plan_slug     VARCHAR(50) REFERENCES subscription_plans(slug) ON DELETE SET NULL,
  sort_order        INTEGER NOT NULL DEFAULT 0,
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  is_premium        BOOLEAN NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT uq_templates_slug UNIQUE (slug),
  CONSTRAINT chk_templates_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

CREATE INDEX idx_templates_active ON invitation_templates (sort_order)
  WHERE is_active = TRUE;
CREATE INDEX idx_templates_premium ON invitation_templates (is_premium)
  WHERE is_active = TRUE;

CREATE TRIGGER trg_invitation_templates_updated_at
  BEFORE UPDATE ON invitation_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 7. Events (Weddings) ───────────────────────────────────────────────────────
-- A wedding event. Users may own multiple events (multiple invitations).

CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  owner_id          UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  title             VARCHAR(255) NOT NULL,
  partner_one       VARCHAR(100),
  partner_two       VARCHAR(100),
  event_date        DATE,
  event_timezone    VARCHAR(64) NOT NULL DEFAULT 'UTC',
  venue_name        VARCHAR(255),
  venue_address     TEXT,
  cover_image_url   TEXT,

  -- Audit
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Soft delete
  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_events_title_not_blank CHECK (length(trim(title)) > 0)
);

CREATE INDEX idx_events_owner ON events (owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_date ON events (event_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_deleted_at ON events (deleted_at) WHERE deleted_at IS NOT NULL;

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_events_no_hard_delete
  BEFORE DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ─── 8. Event Collaborators ───────────────────────────────────────────────────
-- Grants partner/planner access without transferring ownership.

CREATE TABLE event_collaborators (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            collaborator_role NOT NULL DEFAULT 'viewer',

  invited_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at     TIMESTAMPTZ,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT uq_event_collaborator UNIQUE (event_id, user_id)
);

CREATE INDEX idx_collaborators_event ON event_collaborators (event_id);
CREATE INDEX idx_collaborators_user ON event_collaborators (user_id);

CREATE TRIGGER trg_event_collaborators_updated_at
  BEFORE UPDATE ON event_collaborators
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 9. Invitations ───────────────────────────────────────────────────────────
-- Digital invitation pages. Multiple invitations allowed per event
-- (e.g. save-the-date, ceremony, reception).

CREATE TABLE invitations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_id          UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  template_id       UUID REFERENCES invitation_templates(id) ON DELETE SET NULL,

  slug              VARCHAR(100) NOT NULL,
  status            invitation_status NOT NULL DEFAULT 'draft',

  headline          VARCHAR(255),
  subheadline       TEXT,
  body_content      TEXT,
  theme_config      JSONB NOT NULL DEFAULT '{}',

  rsvp_deadline     DATE,
  password_protected BOOLEAN NOT NULL DEFAULT FALSE,
  access_password   VARCHAR(255),

  published_at      TIMESTAMPTZ,
  view_count        BIGINT NOT NULL DEFAULT 0,

  -- Audit
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Soft delete
  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_invitations_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT chk_invitations_view_count_non_negative CHECK (view_count >= 0)
);

CREATE UNIQUE INDEX uq_invitations_slug_active
  ON invitations (slug)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_invitations_event ON invitations (event_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invitations_status ON invitations (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_invitations_template ON invitations (template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_invitations_published ON invitations (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE TRIGGER trg_invitations_updated_at
  BEFORE UPDATE ON invitations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invitations_no_hard_delete
  BEFORE DELETE ON invitations
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ─── 10. Invitation Sections ──────────────────────────────────────────────────
-- Modular editorial blocks within an invitation page.

CREATE TABLE invitation_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  invitation_id   UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  section_type    section_type NOT NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  content         JSONB NOT NULL DEFAULT '{}',
  is_visible      BOOLEAN NOT NULL DEFAULT TRUE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,

  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_sections_sort_order_non_negative CHECK (sort_order >= 0)
);

CREATE UNIQUE INDEX uq_sections_order_per_invitation
  ON invitation_sections (invitation_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_sections_invitation ON invitation_sections (invitation_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_sections_type ON invitation_sections (section_type)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_invitation_sections_updated_at
  BEFORE UPDATE ON invitation_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invitation_sections_no_hard_delete
  BEFORE DELETE ON invitation_sections
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ─── 11. Guests ───────────────────────────────────────────────────────────────
-- Invitees for an event. Authenticated for RSVP via unique access token.

CREATE TABLE guests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_id        UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,

  email           CITEXT,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  role            guest_role NOT NULL DEFAULT 'guest',
  party_size      INTEGER NOT NULL DEFAULT 1,
  plus_one_allowed BOOLEAN NOT NULL DEFAULT FALSE,

  access_token    VARCHAR(64) NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invite_sent_at  TIMESTAMPTZ,
  notes           TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID REFERENCES users(id) ON DELETE SET NULL,

  deleted_at      TIMESTAMPTZ,
  deleted_by      UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_guests_party_size_positive CHECK (party_size >= 1),
  CONSTRAINT chk_guests_names_not_blank
    CHECK (length(trim(first_name)) > 0 AND length(trim(last_name)) > 0)
);

CREATE UNIQUE INDEX uq_guests_access_token ON guests (access_token);

CREATE INDEX idx_guests_event ON guests (event_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_guests_email ON guests (event_id, email) WHERE deleted_at IS NULL AND email IS NOT NULL;
CREATE INDEX idx_guests_name ON guests (event_id, last_name, first_name) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_guests_no_hard_delete
  BEFORE DELETE ON guests
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ─── 12. RSVPs ───────────────────────────────────────────────────────────────
-- Guest responses. One row per guest per invitation.

CREATE TABLE rsvps (
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

CREATE INDEX idx_rsvps_invitation ON rsvps (invitation_id);
CREATE INDEX idx_rsvps_guest ON rsvps (guest_id);
CREATE INDEX idx_rsvps_status ON rsvps (invitation_id, status);
CREATE INDEX idx_rsvps_pending ON rsvps (invitation_id)
  WHERE status = 'pending';

CREATE TRIGGER trg_rsvps_updated_at
  BEFORE UPDATE ON rsvps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 13. Media Assets ─────────────────────────────────────────────────────────
-- Uploaded photos and files. Storage usage counted against subscription limits.

CREATE TABLE media_assets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  event_id          UUID NOT NULL REFERENCES events(id) ON DELETE RESTRICT,
  uploaded_by       UUID REFERENCES users(id) ON DELETE SET NULL,
  invitation_id     UUID REFERENCES invitations(id) ON DELETE SET NULL,

  file_name         VARCHAR(255) NOT NULL,
  file_url          TEXT NOT NULL,
  storage_key       VARCHAR(512) NOT NULL,
  mime_type         VARCHAR(100) NOT NULL,
  asset_type        media_asset_type NOT NULL DEFAULT 'image',
  file_size_bytes   BIGINT NOT NULL DEFAULT 0,
  width_px          INTEGER,
  height_px         INTEGER,
  alt_text          VARCHAR(255),
  sort_order        INTEGER NOT NULL DEFAULT 0,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT chk_media_file_size_non_negative CHECK (file_size_bytes >= 0),
  CONSTRAINT chk_media_sort_order_non_negative CHECK (sort_order >= 0),
  CONSTRAINT uq_media_storage_key UNIQUE (storage_key)
);

CREATE INDEX idx_media_event ON media_assets (event_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_invitation ON media_assets (invitation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_uploaded_by ON media_assets (uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_media_type ON media_assets (event_id, asset_type) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_media_assets_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_media_assets_no_hard_delete
  BEFORE DELETE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete();

-- ─── 14. Audit Logs ───────────────────────────────────────────────────────────
-- Immutable append-only trail for compliance and debugging.

CREATE TABLE audit_logs (
  id              BIGSERIAL PRIMARY KEY,

  user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  action          audit_action NOT NULL,
  table_name      VARCHAR(64) NOT NULL,
  record_id       UUID NOT NULL,

  old_data        JSONB,
  new_data        JSONB,
  ip_address      INET,
  user_agent      TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs (table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- ─── Subscription Entitlement Views ───────────────────────────────────────────

CREATE OR REPLACE VIEW v_user_entitlements AS
SELECT
  u.id AS user_id,
  s.id AS subscription_id,
  s.status AS subscription_status,
  p.slug AS plan_slug,
  p.name AS plan_name,
  p.max_invitations,
  p.max_guests_per_event,
  p.max_storage_mb,
  p.max_collaborators,
  p.features,
  s.current_period_end,
  s.trial_ends_at
FROM users u
LEFT JOIN subscriptions s
  ON s.user_id = u.id
  AND s.status IN ('trialing', 'active', 'past_due')
LEFT JOIN subscription_plans p ON p.id = s.plan_id
WHERE u.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_active_invitations AS
SELECT i.*
FROM invitations i
JOIN events e ON e.id = i.event_id
WHERE i.deleted_at IS NULL
  AND e.deleted_at IS NULL;

-- ─── Helper Views for Application Queries ─────────────────────────────────────

CREATE OR REPLACE VIEW v_rsvp_summary AS
SELECT
  r.invitation_id,
  COUNT(*) AS total_guests,
  COUNT(*) FILTER (WHERE r.status = 'attending') AS attending,
  COUNT(*) FILTER (WHERE r.status = 'declined') AS declined,
  COUNT(*) FILTER (WHERE r.status = 'maybe') AS maybe,
  COUNT(*) FILTER (WHERE r.status = 'pending') AS pending,
  COALESCE(SUM(r.attending_count) FILTER (WHERE r.status = 'attending'), 0) AS total_attending_count
FROM rsvps r
GROUP BY r.invitation_id;

-- ─── Seed: Default Subscription Plans ─────────────────────────────────────────

INSERT INTO subscription_plans (
  name, slug, description, price_cents, billing_interval,
  max_invitations, max_guests_per_event, max_storage_mb, max_collaborators,
  features, sort_order, is_active, is_featured
) VALUES
(
  'Essence',
  'essence',
  'A single elegant invitation for intimate celebrations.',
  0,
  'lifetime',
  1,
  50,
  250,
  1,
  '["1 invitation", "50 guests", "250 MB storage", "RSVP tracking"]',
  1,
  TRUE,
  FALSE
),
(
  'Signature',
  'signature',
  'Multiple invitations with premium templates and expanded guest lists.',
  4900,
  'yearly',
  3,
  200,
  2048,
  3,
  '["3 invitations", "200 guests per event", "2 GB storage", "Premium templates", "CSV guest import"]',
  2,
  TRUE,
  TRUE
),
(
  'Heirloom',
  'heirloom',
  'Unlimited luxury for the discerning couple.',
  9900,
  'yearly',
  NULL,
  NULL,
  10240,
  10,
  '["Unlimited invitations", "Unlimited guests", "10 GB storage", "All premium templates", "Priority support", "Custom domain"]',
  3,
  TRUE,
  FALSE
);

-- ─── Seed: Default Invitation Templates ───────────────────────────────────────

INSERT INTO invitation_templates (
  name, slug, description, preview_image_url,
  theme_config, default_sections, min_plan_slug, sort_order, is_premium
) VALUES
(
  'Golden Hour',
  'golden-hour',
  'Warm champagne tones with cinematic hero photography.',
  '/templates/golden-hour/preview.jpg',
  '{"primary": "#6d5c43", "primaryContainer": "#d8c2a3", "fontDisplay": "Playfair Display", "fontBody": "Inter"}',
  '[{"sectionType": "hero", "sortOrder": 0}, {"sectionType": "story", "sortOrder": 1}, {"sectionType": "schedule", "sortOrder": 2}, {"sectionType": "rsvp", "sortOrder": 3}]',
  'essence',
  1,
  FALSE
),
(
  'Editorial Noir',
  'editorial-noir',
  'High-contrast monochrome with bold serif typography.',
  '/templates/editorial-noir/preview.jpg',
  '{"primary": "#303030", "primaryContainer": "#e5e2e1", "fontDisplay": "Playfair Display", "fontBody": "Inter"}',
  '[{"sectionType": "hero", "sortOrder": 0}, {"sectionType": "gallery", "sortOrder": 1}, {"sectionType": "schedule", "sortOrder": 2}, {"sectionType": "rsvp", "sortOrder": 3}]',
  'signature',
  2,
  TRUE
),
(
  'Garden Estate',
  'garden-estate',
  'Organic rectangles with soft botanical accents and parallax hero.',
  '/templates/garden-estate/preview.jpg',
  '{"primary": "#795835", "primaryContainer": "#e9bd93", "fontDisplay": "Playfair Display", "fontBody": "Inter"}',
  '[{"sectionType": "hero", "sortOrder": 0}, {"sectionType": "story", "sortOrder": 1}, {"sectionType": "gallery", "sortOrder": 2}, {"sectionType": "registry", "sortOrder": 3}, {"sectionType": "rsvp", "sortOrder": 4}]',
  'heirloom',
  3,
  TRUE
);

-- =============================================================================
-- RELATIONSHIP SUMMARY
-- =============================================================================
--
--  users.id              ← subscriptions.user_id           (1:N, RESTRICT)
--  subscription_plans.id ← subscriptions.plan_id         (1:N, RESTRICT)
--  users.id              ← user_sessions.user_id         (1:N, CASCADE)
--  users.id              ← password_reset_tokens.user_id (1:N, CASCADE)
--  users.id              ← events.owner_id               (1:N, RESTRICT)
--  events.id             ← event_collaborators.event_id  (1:N, CASCADE)
--  users.id              ← event_collaborators.user_id   (1:N, CASCADE)
--  events.id             ← invitations.event_id          (1:N, RESTRICT)
--  invitation_templates.id ← invitations.template_id     (1:N, SET NULL)
--  invitations.id        ← invitation_sections.invitation_id (1:N, CASCADE)
--  events.id             ← guests.event_id               (1:N, RESTRICT)
--  guests.id             ← rsvps.guest_id                (1:N, RESTRICT)
--  invitations.id        ← rsvps.invitation_id         (1:N, RESTRICT)
--  events.id             ← media_assets.event_id         (1:N, RESTRICT)
--  invitations.id        ← media_assets.invitation_id    (1:N, SET NULL)
--  users.id              ← media_assets.uploaded_by      (1:N, SET NULL)
--  users.id              ← audit_logs.user_id            (1:N, SET NULL)
--
-- SOFT DELETE STRATEGY
--   Tables: users, events, invitations, invitation_sections, guests, media_assets
--   Pattern: SET deleted_at = NOW(), deleted_by = <actor_id>
--   Hard DELETE blocked via prevent_hard_delete() trigger
--   Partial unique indexes enforce uniqueness only among active (non-deleted) rows
--   Child tables use ON DELETE RESTRICT to preserve referential integrity
--
-- AUDIT FIELDS
--   All mutable entities: created_at, updated_at (+ updated_at trigger)
--   User-attributed entities: created_by, updated_by (FK → users)
--   Soft-deleted entities: deleted_at, deleted_by (FK → users)
--   Immutable audit_logs table for change trail (old_data / new_data JSONB)
--
-- SUBSCRIPTION SUPPORT
--   subscription_plans  — tier catalog with entitlement limits
--   subscriptions       — per-user billing state (Stripe-ready)
--   v_user_entitlements — resolved active plan + limits for middleware checks
--
-- =============================================================================

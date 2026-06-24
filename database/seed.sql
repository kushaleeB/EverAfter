-- EverAfter Seed Data
-- Development / demo dataset (run after schema.sql)

-- Demo user (password: "everafter" — bcrypt hash placeholder)
INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified_at)
VALUES (
  'a0000000-0000-4000-8000-000000000001',
  'demo@everafter.app',
  '$2b$10$placeholder_hash_replace_in_phase_2',
  'Eleanor',
  'Ashford',
  NOW()
);

-- Demo subscription (Essence plan)
INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
SELECT
  'a0000000-0000-4000-8000-000000000001',
  id,
  'active',
  NOW(),
  NOW() + INTERVAL '1 year'
FROM subscription_plans
WHERE slug = 'essence';

-- Demo event
INSERT INTO events (id, owner_id, title, partner_one, partner_two, event_date, venue_name, venue_address, created_by)
VALUES (
  'b0000000-0000-4000-8000-000000000001',
  'a0000000-0000-4000-8000-000000000001',
  'Eleanor & James',
  'Eleanor',
  'James',
  '2026-09-12',
  'The Glasshouse at Syon',
  'Syon Park, Brentford, London TW8 8JF',
  'a0000000-0000-4000-8000-000000000001'
);

-- Demo invitation (Golden Hour template)
INSERT INTO invitations (id, event_id, template_id, slug, status, headline, subheadline, body_content, theme_config, published_at, created_by)
SELECT
  'c0000000-0000-4000-8000-000000000001',
  'b0000000-0000-4000-8000-000000000001',
  t.id,
  'eleanor-and-james',
  'published',
  'Together, Forever',
  'We invite you to celebrate our wedding',
  'Join us for an evening of love, laughter, and celebration.',
  '{"primary": "#6d5c43", "fontDisplay": "Playfair Display", "fontBody": "Inter"}',
  NOW(),
  'a0000000-0000-4000-8000-000000000001'
FROM invitation_templates t
WHERE t.slug = 'golden-hour';

-- Invitation sections
INSERT INTO invitation_sections (invitation_id, section_type, sort_order, content, created_by) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'hero', 0, '{"imageUrl": "/images/hero.jpg", "overlayOpacity": 0.3}', 'a0000000-0000-4000-8000-000000000001'),
  ('c0000000-0000-4000-8000-000000000001', 'story', 1, '{"title": "Our Story", "body": "We met on a rainy afternoon in Notting Hill..."}', 'a0000000-0000-4000-8000-000000000001'),
  ('c0000000-0000-4000-8000-000000000001', 'schedule', 2, '{"items": [{"time": "15:00", "label": "Ceremony"}, {"time": "17:00", "label": "Reception"}]}', 'a0000000-0000-4000-8000-000000000001'),
  ('c0000000-0000-4000-8000-000000000001', 'rsvp', 3, '{"deadline": "2026-08-01", "message": "Kindly respond by August 1st"}', 'a0000000-0000-4000-8000-000000000001');

-- Demo guests
INSERT INTO guests (id, event_id, email, first_name, last_name, role, category, party_size, created_by) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'sarah.chen@example.com', 'Sarah', 'Chen', 'guest', 'family', 2, 'a0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000001', 'marcus.wright@example.com', 'Marcus', 'Wright', 'guest', 'friends', 1, 'a0000000-0000-4000-8000-000000000001'),
  ('d0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000001', 'james@example.com', 'James', 'Ashford', 'partner', 'family', 1, 'a0000000-0000-4000-8000-000000000001');

-- Demo RSVPs
INSERT INTO rsvps (guest_id, invitation_id, status, attending_count, responded_at) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'attending', 2, NOW()),
  ('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'pending', 0, NULL);

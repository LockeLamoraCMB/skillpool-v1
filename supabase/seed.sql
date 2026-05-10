-- Optional starter seed data for the live Supabase-backed UI.
-- Run this after schema.sql if you want the app to show real rows immediately.

insert into public.programs (name, slug, description)
values
  ('BSIT', 'bsit', 'Coding help, debugging, system builds, and digital project support.'),
  ('BSCPE', 'bscpe', 'Embedded systems, circuitry, lab support, and practical walkthroughs.'),
  ('BSTM', 'bstm', 'Tourism decks, itinerary writing, captions, and event support.'),
  ('BSHM', 'bshm', 'Hospitality tasks, menu boards, recipe costing, and event-ready outputs.'),
  ('BSBA-OM', 'bsba-om', 'Dashboards, forms, process maps, and office-ready business support.')
on conflict (slug) do nothing;

insert into public.courses (program_id, name, slug, description)
select p.id, c.name, c.slug, c.description
from public.programs p
join (
  values
    ('bsit', 'Web Systems and Technologies', 'web-systems', 'Frontend builds, backend basics, deployment, and debugging.'),
    ('bsit', 'Database Management', 'database-management', 'ERD design, SQL queries, normalization, and documentation.'),
    ('bscpe', 'Embedded Systems', 'embedded-systems', 'Arduino, Proteus, sensors, and simulation-based help.'),
    ('bstm', 'Tour Packaging', 'tour-packaging', 'Travel packages, costing, brochures, and trip proposals.'),
    ('bshm', 'Food and Beverage Service', 'food-and-beverage-service', 'Menu boards, service scripts, and restaurant-style training tasks.'),
    ('bsba-om', 'Office Productivity Systems', 'office-productivity-systems', 'Forms, trackers, letters, and document layouts.')
) as c(program_slug, name, slug, description)
on p.slug = c.program_slug
on conflict (program_id, slug) do nothing;

-- Profiles, listings, replies, reviews, badges, and leaderboard rows depend on auth.users IDs.
-- Add those after you enable Auth and create real student accounts.

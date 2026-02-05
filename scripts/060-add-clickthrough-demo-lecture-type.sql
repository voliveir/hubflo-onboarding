-- Migration: Allow 'clickthrough_demo' as a lecture content type for Hubflo Labs-style interactive prototypes
-- Content data shape: { steps: [ { id, image_url, title?, description?, hotspots: [ { x, y, width, height, target_step_id?, hint? } ] } ] }
-- x, y, width, height are percentages (0-100) for responsive hotspot positioning

ALTER TABLE university_lectures
  DROP CONSTRAINT IF EXISTS university_lectures_content_type_check;

ALTER TABLE university_lectures
  ADD CONSTRAINT university_lectures_content_type_check
  CHECK (content_type IN ('video', 'text', 'quiz', 'download', 'link', 'clickthrough_demo'));

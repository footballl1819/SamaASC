-- Add team_photo_url column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_photo_url TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS nav_color TEXT DEFAULT '#1f2937';

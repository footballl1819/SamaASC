-- Add slug column to teams table if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing teams to have slug equal to domain if slug is null
UPDATE teams SET slug = domain WHERE slug IS NULL AND domain IS NOT NULL;

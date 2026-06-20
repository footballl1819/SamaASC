-- Add domain column to teams table if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE;

-- Update existing teams to have domain equal to slug if domain is null
UPDATE teams SET domain = slug WHERE domain IS NULL AND slug IS NOT NULL;

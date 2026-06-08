-- Add formation column to matches so admin can set it before each match
ALTER TABLE matches ADD COLUMN formation TEXT DEFAULT '4-3-3';

-- Add is_starter_match column to match_lineup for per-match starting 11 selection
-- We already have match_lineup table, just ensure it's usable
-- The is_substitute boolean already exists in match_lineup

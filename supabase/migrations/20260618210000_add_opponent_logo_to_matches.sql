-- Add opponent_logo column to matches table
ALTER TABLE matches
ADD COLUMN opponent_logo TEXT;

-- Add comment
COMMENT ON COLUMN matches.opponent_logo IS 'URL of the opponent team logo';

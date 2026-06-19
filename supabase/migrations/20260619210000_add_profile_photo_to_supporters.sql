-- Add profile_photo_url column to supporters table for storing user profile photos
ALTER TABLE supporters ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN supporters.profile_photo_url IS 'URL to supporter profile photo';

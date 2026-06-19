-- Add profile_photo_url column to users table for storing user profile pictures
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_photo_url IS 'URL to user profile photo stored in Supabase storage';

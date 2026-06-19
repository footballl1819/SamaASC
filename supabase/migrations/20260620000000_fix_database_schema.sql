-- Fix database schema - consolidate users management
-- Problem: App was using two different user tables (team_members and users)
-- Solution: Keep only the 'users' table and add missing fields

-- Step 1: Add missing fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Step 2: Ensure teams table has all required fields
ALTER TABLE teams ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_photo_url TEXT;

-- Step 3: Add supporter profile photo support
ALTER TABLE supporters ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_team_id_email ON users(team_id, email);
CREATE INDEX IF NOT EXISTS idx_users_profile_photo ON users(profile_photo_url);
CREATE INDEX IF NOT EXISTS idx_supporters_profile_photo ON supporters(profile_photo_url);

-- Step 5: Update RLS policies for users table to include profile_photo access
DROP POLICY IF EXISTS "users_auth_update" ON users;
CREATE POLICY "users_auth_update" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Step 6: Verify admin account exists in users table for each team
-- (The trigger should have created them, but let's verify)
-- This is handled by the application, not by this migration

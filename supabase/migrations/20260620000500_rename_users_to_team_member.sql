-- Rename users table to team_member for better clarity
-- This aligns with the user's requirement to use team_member instead of users

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_team_created ON teams;
DROP FUNCTION IF EXISTS create_default_admin_user();

-- Rename the table
ALTER TABLE users RENAME TO team_member;

-- Update RLS policies
DROP POLICY IF EXISTS "users_public_select" ON team_member;
DROP POLICY IF EXISTS "users_auth_insert" ON team_member;
DROP POLICY IF EXISTS "users_auth_update" ON team_member;
DROP POLICY IF EXISTS "users_auth_delete" ON team_member;

CREATE POLICY "team_member_public_select" ON team_member FOR SELECT TO anon USING (true);
CREATE POLICY "team_member_auth_insert" ON team_member FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_member_auth_update" ON team_member FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY "team_member_auth_delete" ON team_member FOR DELETE TO authenticated USING (true);

-- Update indexes
DROP INDEX IF EXISTS idx_users_team_id;
DROP INDEX IF EXISTS idx_users_username;

CREATE INDEX idx_team_member_team_id ON team_member(team_id);
CREATE INDEX idx_team_member_username ON team_member(username);

-- Add email column to team_member if it doesn't exist
ALTER TABLE team_member ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE team_member ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add domain column to teams table if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS nav_color TEXT DEFAULT '#3b82f6';

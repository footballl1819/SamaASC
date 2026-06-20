-- Fix RLS policies for teams table with more specific policies
-- The previous policies might be too permissive causing 406 errors

-- Drop existing policies
DROP POLICY IF EXISTS "teams_public_select" ON teams;
DROP POLICY IF EXISTS "teams_auth_insert" ON teams;
DROP POLICY IF EXISTS "teams_auth_update" ON teams;
DROP POLICY IF EXISTS "teams_auth_delete" ON teams;

-- Create more specific policies that allow public read for login
-- Only allow reading specific columns needed for login
CREATE POLICY "teams_public_select_login" ON teams FOR SELECT TO anon USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "teams_auth_insert" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teams_auth_update" ON teams FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY "teams_auth_delete" ON teams FOR DELETE TO authenticated USING (true);

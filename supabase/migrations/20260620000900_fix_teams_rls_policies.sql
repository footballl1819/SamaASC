-- Fix RLS policies for teams table to allow login
-- The current policies block unauthenticated users from reading teams data
-- which prevents login from working

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "teams_select_own" ON teams;
DROP POLICY IF EXISTS "teams_insert_rpc" ON teams;
DROP POLICY IF EXISTS "teams_update_admin" ON teams;
DROP POLICY IF EXISTS "teams_delete_admin" ON teams;

-- Create new policies that allow public read for login
CREATE POLICY "teams_public_select" ON teams FOR SELECT TO anon USING (true);
CREATE POLICY "teams_auth_insert" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teams_auth_update" ON teams FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY "teams_auth_delete" ON teams FOR DELETE TO authenticated USING (true);

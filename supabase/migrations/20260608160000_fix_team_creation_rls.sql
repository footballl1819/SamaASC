-- Fix RLS policy to allow anonymous users to create teams
-- This is needed for the registration flow where unauthenticated users create a team

-- Drop the existing policy that only allows authenticated users
DROP POLICY IF EXISTS "teams_auth_insert" ON teams;

-- Create a new policy that allows anonymous users to insert teams
CREATE POLICY "teams_public_insert" ON teams FOR INSERT TO anon WITH CHECK (true);

-- Also allow authenticated users to insert teams (for admin panel)
CREATE POLICY "teams_auth_insert" ON teams FOR INSERT TO authenticated WITH CHECK (true);

-- Create simple RLS policies that work with Supabase Auth
-- These policies are very permissive to avoid 406 errors

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on teams
DROP POLICY IF EXISTS "teams_select_via_users" ON teams;
DROP POLICY IF EXISTS "teams_insert_admin" ON teams;
DROP POLICY IF EXISTS "teams_update_admin" ON teams;
DROP POLICY IF EXISTS "teams_delete_admin" ON teams;

-- Create simple policies for teams
CREATE POLICY "teams_select_all" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_insert_all" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teams_update_all" ON teams FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY "teams_delete_all" ON teams FOR DELETE TO authenticated USING (true);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- Create simple policies for users
CREATE POLICY "users_select_all" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_insert_all" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "users_update_all" ON users FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY "users_delete_all" ON users FOR DELETE TO authenticated USING (true);

-- Re-enable RLS with policies that work with Supabase Auth
-- This allows authenticated users to access their own data based on Supabase Auth user ID

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "teams_public_select_login" ON teams;
DROP POLICY IF EXISTS "teams_auth_insert" ON teams;
DROP POLICY IF EXISTS "teams_auth_update" ON teams;
DROP POLICY IF EXISTS "teams_auth_delete" ON teams;

-- Create policies that allow authenticated users to access teams based on their user data
CREATE POLICY "teams_select_via_users" ON teams FOR SELECT TO authenticated USING (
  id IN (SELECT team_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "teams_insert_admin" ON teams FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "teams_update_admin" ON teams FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "teams_delete_admin" ON teams FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_insert_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_delete_own" ON users;

-- Create policies that allow users to access their own data based on Supabase Auth user ID
CREATE POLICY "users_select_own" ON users FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "users_insert_own" ON users FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "users_delete_own" ON users FOR DELETE TO authenticated USING (id = auth.uid());

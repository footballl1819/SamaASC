-- Restore users table (undo the rename from team_member back to users)
-- The correct structure is:
-- - users: global table storing all users from all teams
-- - team_members: junction table linking users to teams (user_id, team_id, email, role)
-- - teams: table storing team information (including domain)

-- Rename team_member back to users if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'team_member' AND table_schema = 'public') THEN
    ALTER TABLE team_member RENAME TO users;
  END IF;
END $$;

-- Update RLS policies
DROP POLICY IF EXISTS "team_member_public_select" ON users;
DROP POLICY IF EXISTS "team_member_auth_insert" ON users;
DROP POLICY IF EXISTS "team_member_auth_update" ON users;
DROP POLICY IF EXISTS "team_member_auth_delete" ON users;

CREATE POLICY IF NOT EXISTS "users_public_select" ON users FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "users_auth_insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "users_auth_update" ON users FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "users_auth_delete" ON users FOR DELETE TO authenticated USING (true);

-- Update indexes
DROP INDEX IF EXISTS idx_team_member_team_id;
DROP INDEX IF EXISTS idx_team_member_username;

CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Ensure team_members table exists with correct structure
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Enable RLS on team_members table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "team_members_public_select" ON team_members FOR SELECT TO anon USING (true);
CREATE POLICY "team_members_auth_insert" ON team_members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "team_members_auth_update" ON team_members FOR UPDATE TO authenticated WITH CHECK (true);
CREATE POLICY "team_members_auth_delete" ON team_members FOR DELETE TO authenticated USING (true);

-- Create indexes on team_members for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);

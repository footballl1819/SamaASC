-- Add users table for team member authentication
-- Each team has its own users with admin having fixed credentials (admin/admin123)

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "users_public_select" ON users FOR SELECT TO anon USING (true);
CREATE POLICY "users_auth_insert" ON users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "users_auth_update" ON users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "users_auth_delete" ON users FOR DELETE TO authenticated USING (true);

-- Create index on team_id and username for better performance
CREATE INDEX idx_users_team_id ON users(team_id);
CREATE INDEX idx_users_username ON users(username);

-- Function to create default admin user when team is created
CREATE OR REPLACE FUNCTION create_default_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (team_id, username, password, name, role)
  VALUES (NEW.id, 'admin', 'admin123', 'Administrateur', 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create admin user when team is created
CREATE TRIGGER on_team_created
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION create_default_admin_user();

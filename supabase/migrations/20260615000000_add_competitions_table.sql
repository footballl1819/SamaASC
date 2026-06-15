-- Competitions table for dynamic competition management
CREATE TABLE competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  team_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "competitions_public_select" ON competitions FOR SELECT TO anon USING (true);
CREATE POLICY "competitions_auth_insert" ON competitions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "competitions_auth_update" ON competitions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "competitions_auth_delete" ON competitions FOR DELETE TO authenticated USING (true);

-- Create unique constraint on (name, team_id)
ALTER TABLE competitions ADD CONSTRAINT competitions_name_team_id_unique UNIQUE (name, team_id);

-- Create index on team_id for faster queries
CREATE INDEX idx_competitions_team_id ON competitions(team_id);

-- Insert default competitions for existing teams
INSERT INTO competitions (name, team_id)
SELECT DISTINCT 
  unnest(ARRAY['Coupe Maire', 'Coupe Zonal', 'Coupe Départementale', 'Coupe Régional', 'Amical']) as name,
  t.id as team_id
FROM teams t
ON CONFLICT (name, team_id) DO NOTHING;

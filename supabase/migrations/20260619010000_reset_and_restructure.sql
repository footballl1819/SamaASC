-- Reset database and restructure for new multi-tenant system
-- This will delete all existing data and create the new structure

-- Delete all existing data from tables
TRUNCATE TABLE match_votes CASCADE;
TRUNCATE TABLE supporters CASCADE;
TRUNCATE TABLE gallery CASCADE;
TRUNCATE TABLE standings CASCADE;
TRUNCATE TABLE announcements CASCADE;
TRUNCATE TABLE match_lineup CASCADE;
TRUNCATE TABLE matches CASCADE;
TRUNCATE TABLE players CASCADE;
TRUNCATE TABLE coach CASCADE;

-- Drop existing teams table if it exists
DROP TABLE IF EXISTS teams CASCADE;

-- Drop existing team_members table if it exists
DROP TABLE IF EXISTS team_members CASCADE;

-- Create new teams table with domain and admin_email
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  admin_email TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  accent_color TEXT DEFAULT '#f59e0b',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create team_members table with role
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Add team_id to all existing tables (if not already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coach' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE coach ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE players ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'matches' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE matches ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'match_lineup' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE match_lineup ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'announcements' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE announcements ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'standings' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE standings ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gallery' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE gallery ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'match_votes' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE match_votes ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'supporters' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE supporters ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineup ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_teams_domain ON teams(domain);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_coach_team_id ON coach(team_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_match_lineup_team_id ON match_lineup(team_id);
CREATE INDEX idx_announcements_team_id ON announcements(team_id);
CREATE INDEX idx_standings_team_id ON standings(team_id);
CREATE INDEX idx_gallery_team_id ON gallery(team_id);
CREATE INDEX idx_match_votes_team_id ON match_votes(team_id);
CREATE INDEX idx_supporters_team_id ON supporters(team_id);

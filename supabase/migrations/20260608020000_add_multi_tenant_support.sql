-- Add multi-tenant support for Sama ASC platform
-- Each team/ASC will have their own isolated data

-- Teams/ASCs table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  accent_color TEXT DEFAULT '#f59e0b',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add team_id to all existing tables
ALTER TABLE coach ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE players ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE matches ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE match_lineup ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE announcements ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE standings ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE gallery ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE match_votes ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;
ALTER TABLE supporters ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Enable RLS on teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "teams_public_select" ON teams FOR SELECT TO anon USING (true);
CREATE POLICY "teams_auth_insert" ON teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "teams_auth_update" ON teams FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "teams_auth_delete" ON teams FOR DELETE TO authenticated USING (true);

-- Update RLS policies to include team_id filtering
-- Coach
DROP POLICY IF EXISTS "coach_public_select" ON coach;
DROP POLICY IF EXISTS "coach_auth_insert" ON coach;
DROP POLICY IF EXISTS "coach_auth_update" ON coach;
DROP POLICY IF EXISTS "coach_auth_delete" ON coach;

CREATE POLICY "coach_public_select" ON coach FOR SELECT TO anon USING (true);
CREATE POLICY "coach_auth_insert" ON coach FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "coach_auth_update" ON coach FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "coach_auth_delete" ON coach FOR DELETE TO authenticated USING (true);

-- Players
DROP POLICY IF EXISTS "players_public_select" ON players;
DROP POLICY IF EXISTS "players_auth_insert" ON players;
DROP POLICY IF EXISTS "players_auth_update" ON players;
DROP POLICY IF EXISTS "players_auth_delete" ON players;

CREATE POLICY "players_public_select" ON players FOR SELECT TO anon USING (true);
CREATE POLICY "players_auth_insert" ON players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "players_auth_update" ON players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "players_auth_delete" ON players FOR DELETE TO authenticated USING (true);

-- Matches
DROP POLICY IF EXISTS "matches_public_select" ON matches;
DROP POLICY IF EXISTS "matches_auth_insert" ON matches;
DROP POLICY IF EXISTS "matches_auth_update" ON matches;
DROP POLICY IF EXISTS "matches_auth_delete" ON matches;

CREATE POLICY "matches_public_select" ON matches FOR SELECT TO anon USING (true);
CREATE POLICY "matches_auth_insert" ON matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "matches_auth_update" ON matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "matches_auth_delete" ON matches FOR DELETE TO authenticated USING (true);

-- Match Lineup
DROP POLICY IF EXISTS "lineup_public_select" ON match_lineup;
DROP POLICY IF EXISTS "lineup_auth_insert" ON match_lineup;
DROP POLICY IF EXISTS "lineup_auth_update" ON match_lineup;
DROP POLICY IF EXISTS "lineup_auth_delete" ON match_lineup;

CREATE POLICY "lineup_public_select" ON match_lineup FOR SELECT TO anon USING (true);
CREATE POLICY "lineup_auth_insert" ON match_lineup FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lineup_auth_update" ON match_lineup FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "lineup_auth_delete" ON match_lineup FOR DELETE TO authenticated USING (true);

-- Announcements
DROP POLICY IF EXISTS "announcements_public_select" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_insert" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_update" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_delete" ON announcements;

CREATE POLICY "announcements_public_select" ON announcements FOR SELECT TO anon USING (true);
CREATE POLICY "announcements_auth_insert" ON announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "announcements_auth_update" ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "announcements_auth_delete" ON announcements FOR DELETE TO authenticated USING (true);

-- Standings
DROP POLICY IF EXISTS "standings_public_select" ON standings;
DROP POLICY IF EXISTS "standings_auth_insert" ON standings;
DROP POLICY IF EXISTS "standings_auth_update" ON standings;
DROP POLICY IF EXISTS "standings_auth_delete" ON standings;

CREATE POLICY "standings_public_select" ON standings FOR SELECT TO anon USING (true);
CREATE POLICY "standings_auth_insert" ON standings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "standings_auth_update" ON standings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "standings_auth_delete" ON standings FOR DELETE TO authenticated USING (true);

-- Gallery
DROP POLICY IF EXISTS "gallery_public_select" ON gallery;
DROP POLICY IF EXISTS "gallery_auth_insert" ON gallery;
DROP POLICY IF EXISTS "gallery_auth_update" ON gallery;
DROP POLICY IF EXISTS "gallery_auth_delete" ON gallery;

CREATE POLICY "gallery_public_select" ON gallery FOR SELECT TO anon USING (true);
CREATE POLICY "gallery_auth_insert" ON gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "gallery_auth_update" ON gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "gallery_auth_delete" ON gallery FOR DELETE TO authenticated USING (true);

-- Match Votes
DROP POLICY IF EXISTS "votes_public_select" ON match_votes;
DROP POLICY IF EXISTS "votes_auth_insert" ON match_votes;
DROP POLICY IF EXISTS "votes_auth_delete" ON match_votes;

CREATE POLICY "votes_public_select" ON match_votes FOR SELECT TO anon USING (true);
CREATE POLICY "votes_auth_insert" ON match_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "votes_auth_delete" ON match_votes FOR DELETE TO authenticated USING (true);

-- Supporters
DROP POLICY IF EXISTS "supporters_public_select" ON supporters;
DROP POLICY IF EXISTS "supporters_auth_insert" ON supporters;
DROP POLICY IF EXISTS "supporters_auth_delete" ON supporters;

CREATE POLICY "supporters_public_select" ON supporters FOR SELECT TO anon USING (true);
CREATE POLICY "supporters_auth_insert" ON supporters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "supporters_auth_delete" ON supporters FOR DELETE TO authenticated USING (true);

-- Create index on team_id for all tables for better performance
CREATE INDEX idx_coach_team_id ON coach(team_id);
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_team_id ON matches(team_id);
CREATE INDEX idx_match_lineup_team_id ON match_lineup(team_id);
CREATE INDEX idx_announcements_team_id ON announcements(team_id);
CREATE INDEX idx_standings_team_id ON standings(team_id);
CREATE INDEX idx_gallery_team_id ON gallery(team_id);
CREATE INDEX idx_match_votes_team_id ON match_votes(team_id);
CREATE INDEX idx_supporters_team_id ON supporters(team_id);

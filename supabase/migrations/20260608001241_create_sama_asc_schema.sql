-- Sama ASC Football Team Management Platform

-- Coach info table
CREATE TABLE coach (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT DEFAULT 'Entraineur',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players table
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  position TEXT NOT NULL, -- GK, DEF, MIL, ATT
  jersey_number INTEGER,
  is_starter BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Matches table
CREATE TABLE matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  opponent TEXT NOT NULL,
  match_date DATE NOT NULL,
  match_time TIME,
  venue TEXT,
  competition TEXT,
  is_home BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'postponed')),
  score_home INTEGER,
  score_away INTEGER,
  poster_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Match lineups (starting 11 for each match)
CREATE TABLE match_lineup (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  position_slot INTEGER NOT NULL, -- 1-11 for field positions
  is_substitute BOOLEAN DEFAULT false,
  UNIQUE(match_id, player_id)
);

-- Announcements
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('match', 'training', 'meeting', 'other')),
  event_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Standings / Classement
CREATE TABLE standings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_name TEXT NOT NULL,
  position INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Gallery
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  caption TEXT,
  event_type TEXT DEFAULT 'other',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Man of the match votes
CREATE TABLE match_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  voter_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, player_id, voter_name)
);

-- Supporters messages
CREATE TABLE supporters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE coach ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineup ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;

-- RLS Policies: public read, authenticated write
-- Coach
CREATE POLICY "coach_public_select" ON coach FOR SELECT TO anon USING (true);
CREATE POLICY "coach_auth_insert" ON coach FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "coach_auth_update" ON coach FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "coach_auth_delete" ON coach FOR DELETE TO authenticated USING (true);

-- Players
CREATE POLICY "players_public_select" ON players FOR SELECT TO anon USING (true);
CREATE POLICY "players_auth_insert" ON players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "players_auth_update" ON players FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "players_auth_delete" ON players FOR DELETE TO authenticated USING (true);

-- Matches
CREATE POLICY "matches_public_select" ON matches FOR SELECT TO anon USING (true);
CREATE POLICY "matches_auth_insert" ON matches FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "matches_auth_update" ON matches FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "matches_auth_delete" ON matches FOR DELETE TO authenticated USING (true);

-- Match Lineup
CREATE POLICY "lineup_public_select" ON match_lineup FOR SELECT TO anon USING (true);
CREATE POLICY "lineup_auth_insert" ON match_lineup FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "lineup_auth_update" ON match_lineup FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "lineup_auth_delete" ON match_lineup FOR DELETE TO authenticated USING (true);

-- Announcements
CREATE POLICY "announcements_public_select" ON announcements FOR SELECT TO anon USING (true);
CREATE POLICY "announcements_auth_insert" ON announcements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "announcements_auth_update" ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "announcements_auth_delete" ON announcements FOR DELETE TO authenticated USING (true);

-- Standings
CREATE POLICY "standings_public_select" ON standings FOR SELECT TO anon USING (true);
CREATE POLICY "standings_auth_insert" ON standings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "standings_auth_update" ON standings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "standings_auth_delete" ON standings FOR DELETE TO authenticated USING (true);

-- Gallery
CREATE POLICY "gallery_public_select" ON gallery FOR SELECT TO anon USING (true);
CREATE POLICY "gallery_auth_insert" ON gallery FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "gallery_auth_update" ON gallery FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "gallery_auth_delete" ON gallery FOR DELETE TO authenticated USING (true);

-- Match Votes
CREATE POLICY "votes_public_select" ON match_votes FOR SELECT TO anon USING (true);
CREATE POLICY "votes_auth_insert" ON match_votes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "votes_auth_delete" ON match_votes FOR DELETE TO authenticated USING (true);

-- Supporters
CREATE POLICY "supporters_public_select" ON supporters FOR SELECT TO anon USING (true);
CREATE POLICY "supporters_auth_insert" ON supporters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "supporters_auth_delete" ON supporters FOR DELETE TO authenticated USING (true);

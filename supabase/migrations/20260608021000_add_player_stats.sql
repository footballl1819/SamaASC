-- Player statistics: goals and assists per player per competition
CREATE TABLE player_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  competition_name TEXT NOT NULL,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(player_id, competition_name)
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "player_stats_public_select" ON player_stats FOR SELECT TO anon USING (true);
CREATE POLICY "player_stats_auth_insert" ON player_stats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "player_stats_auth_update" ON player_stats FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "player_stats_auth_delete" ON player_stats FOR DELETE TO authenticated USING (true);

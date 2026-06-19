-- Configure strict RLS policies for team isolation and role-based access

-- Drop all existing policies
DROP POLICY IF EXISTS "teams_public_select" ON teams;
DROP POLICY IF EXISTS "teams_auth_insert" ON teams;
DROP POLICY IF EXISTS "teams_auth_update" ON teams;
DROP POLICY IF EXISTS "teams_auth_delete" ON teams;

DROP POLICY IF EXISTS "coach_public_select" ON coach;
DROP POLICY IF EXISTS "coach_auth_insert" ON coach;
DROP POLICY IF EXISTS "coach_auth_update" ON coach;
DROP POLICY IF EXISTS "coach_auth_delete" ON coach;

DROP POLICY IF EXISTS "players_public_select" ON players;
DROP POLICY IF EXISTS "players_auth_insert" ON players;
DROP POLICY IF EXISTS "players_auth_update" ON players;
DROP POLICY IF EXISTS "players_auth_delete" ON players;

DROP POLICY IF EXISTS "matches_public_select" ON matches;
DROP POLICY IF EXISTS "matches_auth_insert" ON matches;
DROP POLICY IF EXISTS "matches_auth_update" ON matches;
DROP POLICY IF EXISTS "matches_auth_delete" ON matches;

DROP POLICY IF EXISTS "lineup_public_select" ON match_lineup;
DROP POLICY IF EXISTS "lineup_auth_insert" ON match_lineup;
DROP POLICY IF EXISTS "lineup_auth_update" ON match_lineup;
DROP POLICY IF EXISTS "lineup_auth_delete" ON match_lineup;

DROP POLICY IF EXISTS "announcements_public_select" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_insert" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_update" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_delete" ON announcements;

DROP POLICY IF EXISTS "standings_public_select" ON standings;
DROP POLICY IF EXISTS "standings_auth_insert" ON standings;
DROP POLICY IF EXISTS "standings_auth_update" ON standings;
DROP POLICY IF EXISTS "standings_auth_delete" ON standings;

DROP POLICY IF EXISTS "gallery_public_select" ON gallery;
DROP POLICY IF EXISTS "gallery_auth_insert" ON gallery;
DROP POLICY IF EXISTS "gallery_auth_update" ON gallery;
DROP POLICY IF EXISTS "gallery_auth_delete" ON gallery;

DROP POLICY IF EXISTS "votes_public_select" ON match_votes;
DROP POLICY IF EXISTS "votes_auth_insert" ON match_votes;
DROP POLICY IF EXISTS "votes_auth_delete" ON match_votes;

DROP POLICY IF EXISTS "supporters_public_select" ON supporters;
DROP POLICY IF EXISTS "supporters_auth_insert" ON supporters;
DROP POLICY IF EXISTS "supporters_auth_delete" ON supporters;

-- Teams table policies
CREATE POLICY "teams_select_own" ON teams FOR SELECT TO authenticated USING (
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "teams_insert_rpc" ON teams FOR INSERT TO authenticated WITH CHECK (false); -- Only via RPC
CREATE POLICY "teams_update_admin" ON teams FOR UPDATE TO authenticated USING (
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "teams_delete_admin" ON teams FOR DELETE TO authenticated USING (
  id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Team members policies
CREATE POLICY "team_members_select_own_team" ON team_members FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "team_members_insert_rpc" ON team_members FOR INSERT TO authenticated WITH CHECK (false); -- Only via RPC
CREATE POLICY "team_members_update_admin" ON team_members FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "team_members_delete_admin" ON team_members FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Coach policies (team-based)
CREATE POLICY "coach_select_own_team" ON coach FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "coach_insert_own_team" ON coach FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "coach_update_own_team" ON coach FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "coach_delete_own_team" ON coach FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Players policies (team-based)
CREATE POLICY "players_select_own_team" ON players FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "players_insert_own_team" ON players FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "players_update_own_team" ON players FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "players_delete_own_team" ON players FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Matches policies (team-based)
CREATE POLICY "matches_select_own_team" ON matches FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "matches_insert_own_team" ON matches FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "matches_update_own_team" ON matches FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "matches_delete_own_team" ON matches FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Match lineup policies (team-based)
CREATE POLICY "lineup_select_own_team" ON match_lineup FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "lineup_insert_own_team" ON match_lineup FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "lineup_update_own_team" ON match_lineup FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "lineup_delete_own_team" ON match_lineup FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Announcements policies (team-based)
CREATE POLICY "announcements_select_own_team" ON announcements FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "announcements_insert_own_team" ON announcements FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "announcements_update_own_team" ON announcements FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "announcements_delete_own_team" ON announcements FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Standings policies (team-based)
CREATE POLICY "standings_select_own_team" ON standings FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "standings_insert_own_team" ON standings FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "standings_update_own_team" ON standings FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "standings_delete_own_team" ON standings FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Gallery policies (team-based)
CREATE POLICY "gallery_select_own_team" ON gallery FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "gallery_insert_own_team" ON gallery FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "gallery_update_own_team" ON gallery FOR UPDATE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
) WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "gallery_delete_own_team" ON gallery FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Match votes policies (team-based)
CREATE POLICY "votes_select_own_team" ON match_votes FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "votes_insert_own_team" ON match_votes FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "votes_delete_own_team" ON match_votes FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

-- Supporters policies (team-based)
CREATE POLICY "supporters_select_own_team" ON supporters FOR SELECT TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "supporters_insert_own_team" ON supporters FOR INSERT TO authenticated WITH CHECK (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);
CREATE POLICY "supporters_delete_own_team" ON supporters FOR DELETE TO authenticated USING (
  team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
);

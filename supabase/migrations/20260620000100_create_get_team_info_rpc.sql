-- Create new RPC function for team info lookup that works with users table
-- This replaces the old one that depended on team_members table

CREATE OR REPLACE FUNCTION get_team_info_by_user(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  team_info RECORD;
BEGIN
  -- Look up team info from users table instead of team_members
  SELECT 
    t.id as team_id,
    t.name as team_name,
    t.domain as team_domain,
    u.role as user_role
  INTO team_info
  FROM users u
  JOIN teams t ON u.team_id = t.id
  WHERE u.id = p_user_id;
  
  IF team_info.team_id IS NULL THEN
    RETURN json_build_object('error', 'User not associated with any team');
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'team_id', team_info.team_id,
    'team_name', team_info.team_name,
    'team_domain', team_info.team_domain,
    'user_role', team_info.user_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_team_info_by_user TO authenticated;

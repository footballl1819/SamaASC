-- Create RPC functions for secure team and member management

-- Function to validate email domain
CREATE OR REPLACE FUNCTION validate_email_domain(email TEXT, team_domain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Extract domain from email
  RETURN (split_part(email, '@', 2) = team_domain);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a team and add an existing user to it
CREATE OR REPLACE FUNCTION create_team_and_add_user(
  team_name TEXT,
  team_domain TEXT,
  admin_email TEXT,
  user_id UUID
)
RETURNS JSON AS $$
DECLARE
  new_team_id UUID;
BEGIN
  -- Validate email domain
  IF NOT validate_email_domain(admin_email, team_domain) THEN
    RETURN json_build_object('error', 'Email must belong to the team domain');
  END IF;
  
  -- Check if domain already exists
  IF EXISTS (SELECT 1 FROM teams WHERE domain = team_domain) THEN
    RETURN json_build_object('error', 'Domain already exists');
  END IF;
  
  -- Create the team
  INSERT INTO teams (name, domain, admin_email)
  VALUES (team_name, team_domain, admin_email)
  RETURNING id INTO new_team_id;
  
  -- Add user to team_members as admin
  INSERT INTO team_members (user_id, team_id, email, role)
  VALUES (user_id, new_team_id, admin_email, 'admin');
  
  RETURN json_build_object(
    'success', true,
    'team_id', new_team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add an existing user to a team (admin only)
CREATE OR REPLACE FUNCTION add_user_to_team(
  team_id_param UUID,
  user_id_param UUID,
  member_email TEXT
)
RETURNS JSON AS $$
DECLARE
  team_domain TEXT;
  current_user_id UUID;
  current_user_role TEXT;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Get team domain and check if current user is admin
  SELECT domain INTO team_domain FROM teams WHERE id = team_id_param;
  
  IF team_domain IS NULL THEN
    RETURN json_build_object('error', 'Team not found');
  END IF;
  
  -- Check if current user is admin of this team
  SELECT role INTO current_user_role 
  FROM team_members 
  WHERE user_id = current_user_id AND team_id = team_id_param;
  
  IF current_user_role != 'admin' THEN
    RETURN json_build_object('error', 'Only admin can add members');
  END IF;
  
  -- Validate email domain
  IF NOT validate_email_domain(member_email, team_domain) THEN
    RETURN json_build_object('error', 'Email must belong to the team domain');
  END IF;
  
  -- Check if user already exists in team
  IF EXISTS (SELECT 1 FROM team_members WHERE user_id = user_id_param AND team_id = team_id_param) THEN
    RETURN json_build_object('error', 'User already in team');
  END IF;
  
  -- Add user to team_members
  INSERT INTO team_members (user_id, team_id, email, role)
  VALUES (user_id_param, team_id_param, member_email, 'member');
  
  RETURN json_build_object(
    'success', true,
    'user_id', user_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's team and role
CREATE OR REPLACE FUNCTION get_user_team_info()
RETURNS JSON AS $$
DECLARE
  current_user_id UUID;
  team_info RECORD;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;
  
  SELECT 
    t.id as team_id,
    t.name as team_name,
    t.domain as team_domain,
    tm.role as user_role
  INTO team_info
  FROM team_members tm
  JOIN teams t ON tm.team_id = t.id
  WHERE tm.user_id = current_user_id;
  
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

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION validate_email_domain TO authenticated;
GRANT EXECUTE ON FUNCTION create_team_and_add_user TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_to_team TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_team_info TO authenticated;

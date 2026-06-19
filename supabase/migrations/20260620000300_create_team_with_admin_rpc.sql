-- Create team and admin user in the users table (custom auth)
-- This replaces the Supabase Auth approach with the custom users table approach

-- Drop existing function if it exists to avoid conflicts (with different argument types)
DROP FUNCTION IF EXISTS create_team_with_admin(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS create_team_with_admin(TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS create_team_with_admin CASCADE;

CREATE OR REPLACE FUNCTION create_team_with_admin(
  p_team_name TEXT,
  p_team_domain TEXT,
  p_admin_email TEXT,
  p_admin_username TEXT,
  p_admin_password_hash TEXT
)
RETURNS JSON AS $$
DECLARE
  v_team_id UUID;
  v_user_id UUID;
BEGIN
  -- Validate inputs
  IF p_team_name IS NULL OR p_team_name = '' THEN
    RETURN json_build_object('error', 'Team name is required');
  END IF;
  
  IF p_team_domain IS NULL OR p_team_domain = '' THEN
    RETURN json_build_object('error', 'Team domain is required');
  END IF;
  
  IF p_admin_email IS NULL OR p_admin_email = '' THEN
    RETURN json_build_object('error', 'Admin email is required');
  END IF;
  
  -- Check if domain already exists
  IF EXISTS (SELECT 1 FROM teams WHERE domain = p_team_domain OR slug = p_team_domain) THEN
    RETURN json_build_object('error', 'This domain is already in use');
  END IF;
  
  -- Check if team name already exists
  IF EXISTS (SELECT 1 FROM teams WHERE name = p_team_name) THEN
    RETURN json_build_object('error', 'This team name is already in use');
  END IF;
  
  -- Create the team with default colors
  INSERT INTO teams (name, domain, slug, primary_color, secondary_color, accent_color, nav_color)
  VALUES (
    p_team_name, 
    p_team_domain, 
    p_team_domain,
    '#3b82f6',
    '#1e40af',
    '#f59e0b',
    '#3b82f6'
  )
  RETURNING id INTO v_team_id;
  
  -- Generate user ID
  v_user_id := gen_random_uuid();
  
  -- Create the admin user in team_member table with custom password hash
  -- The admin is automatically counted as a member (role: admin)
  INSERT INTO team_member (id, team_id, username, password, name, email, role)
  VALUES (
    v_user_id,
    v_team_id,
    p_admin_username,
    p_admin_password_hash,
    p_admin_username,
    p_admin_email,
    'admin'
  );
  
  RETURN json_build_object(
    'success', true,
    'team_id', v_team_id,
    'user_id', v_user_id,
    'message', 'Team and admin user created successfully. Admin is automatically the first member.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_team_with_admin TO authenticated, anon;

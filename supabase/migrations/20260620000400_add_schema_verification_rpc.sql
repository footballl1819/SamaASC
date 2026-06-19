-- Helper function to verify and initialize the database schema
-- This function can be called from the application to ensure the schema is correct

CREATE OR REPLACE FUNCTION verify_database_schema()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_users_has_email BOOLEAN;
  v_users_has_profile_photo BOOLEAN;
  v_supporters_has_profile_photo BOOLEAN;
BEGIN
  -- Check if users table has email column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) INTO v_users_has_email;

  -- Check if users table has profile_photo_url column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_photo_url'
  ) INTO v_users_has_profile_photo;

  -- Check if supporters table has profile_photo_url column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'supporters' AND column_name = 'profile_photo_url'
  ) INTO v_supporters_has_profile_photo;

  v_result := json_build_object(
    'schema_valid', true,
    'users_email', v_users_has_email,
    'users_profile_photo', v_users_has_profile_photo,
    'supporters_profile_photo', v_supporters_has_profile_photo
  );

  -- If any critical column is missing, add it
  IF NOT v_users_has_email THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
    v_result := jsonb_set(v_result, '{users_email}', 'true'::jsonb);
  END IF;

  IF NOT v_users_has_profile_photo THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
    v_result := jsonb_set(v_result, '{users_profile_photo}', 'true'::jsonb);
  END IF;

  IF NOT v_supporters_has_profile_photo THEN
    ALTER TABLE supporters ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
    v_result := jsonb_set(v_result, '{supporters_profile_photo}', 'true'::jsonb);
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_database_schema TO authenticated, anon;

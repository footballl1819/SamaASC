-- Update password hashing mechanism
-- PostgreSQL 13+ has pgcrypto extension for hashing

-- Ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop old trigger and function
DROP TRIGGER IF EXISTS on_team_created ON teams;
DROP FUNCTION IF EXISTS create_default_admin_user();

-- Create function to hash password using SHA-256
CREATE OR REPLACE FUNCTION hash_password_sha256(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN 'sha256:' || encode(digest(password, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create new function that creates admin with SHA-256 hashed password
-- Default password for admin: "admin123"
CREATE OR REPLACE FUNCTION create_default_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (team_id, username, password, name, role)
  VALUES (
    NEW.id, 
    'admin', 
    hash_password_sha256('admin123'),
    'Administrateur', 
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_team_created
AFTER INSERT ON teams
FOR EACH ROW
EXECUTE FUNCTION create_default_admin_user();

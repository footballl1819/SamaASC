-- Create function to hash passwords with SHA-256 for existing users
-- This ensures all admin123 passwords are properly hashed

-- Function to hash password using pgcrypto
CREATE OR REPLACE FUNCTION hash_password_sha256(password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Return 'sha256:' prefix + hex of SHA-256 hash
  RETURN 'sha256:' || encode(digest(password, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update existing admin users with hashed password if they have plain text
-- Check if password is plain text (doesn't start with 'sha256:')
UPDATE users 
SET password = hash_password_sha256(password)
WHERE password NOT LIKE 'sha256:%' AND username = 'admin';

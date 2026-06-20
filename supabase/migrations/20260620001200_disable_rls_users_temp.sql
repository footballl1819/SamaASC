-- Temporarily disable RLS on users table to diagnose authentication error
-- This will help identify if the issue is with RLS policies on users table

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

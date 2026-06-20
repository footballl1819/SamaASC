-- Temporarily disable RLS on teams table to diagnose 406 error
-- This will help identify if the issue is with RLS policies

ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

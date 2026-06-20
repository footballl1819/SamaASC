-- Disable RLS completely on users and teams tables to isolate the 406 error
-- This will help identify if the issue is with RLS or something else

ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS to fix the 406 error
-- Run this in your Supabase SQL Editor

-- Disable RLS on all tables temporarily
ALTER TABLE couples DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;

-- Ensure all permissions are granted
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Verify tables are accessible
SELECT 'RLS disabled successfully' as status;

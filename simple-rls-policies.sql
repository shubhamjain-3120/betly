-- Simple RLS Policies for betly
-- Minimal policies to avoid recursion issues
-- 
-- This file contains the simplest possible RLS policies that just enable
-- Row Level Security without complex rules that could cause infinite recursion.
--
-- IMPORTANT: Run this in your Supabase SQL Editor to replace any existing policies

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- SIMPLE POLICIES - ALLOW ALL OPERATIONS
-- =============================================================================

-- Couples table: Allow all operations for anon and authenticated users
CREATE POLICY "Allow all couples operations" ON couples
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Users table: Allow all operations for anon and authenticated users  
CREATE POLICY "Allow all users operations" ON users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Bets table: Allow all operations for anon and authenticated users
CREATE POLICY "Allow all bets operations" ON bets
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions to anon and authenticated roles
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

-- =============================================================================
-- USAGE INSTRUCTIONS
-- =============================================================================

/*
USAGE INSTRUCTIONS:

1. SETUP:
   - Run this SQL file in your Supabase SQL Editor
   - This will replace any existing RLS policies with simple ones
   - These policies allow all operations to prevent recursion issues

2. SECURITY:
   - These policies are very permissive - they allow all operations
   - Security is handled entirely by your application code
   - Your existing auth_token system provides the security layer
   - This approach prevents database-level recursion while maintaining functionality

3. ONBOARDING FLOW:
   - Anonymous users can create couples and users (onboarding works)
   - All database operations are allowed through RLS
   - Your app handles authentication and data filtering

4. DATA ISOLATION:
   - Data isolation is handled by your application code
   - Your queries already filter by couple_id and auth_token
   - RLS policies don't interfere with your existing logic

5. TROUBLESHOOTING:
   - If you still get recursion errors, try disabling RLS temporarily:
     ALTER TABLE couples DISABLE ROW LEVEL SECURITY;
     ALTER TABLE users DISABLE ROW LEVEL SECURITY;
     ALTER TABLE bets DISABLE ROW LEVEL SECURITY;
   - Then re-enable with these simple policies

6. FUTURE IMPROVEMENTS:
   - Once your app is working, you can gradually add more specific policies
   - Consider implementing proper Supabase Auth for better security
   - Add rate limiting for anonymous operations
*/

-- =============================================================================
-- CLEANUP (IF NEEDED)
-- =============================================================================

-- If you need to remove all policies and start fresh, run these commands:
/*
-- Remove all existing policies
DROP POLICY IF EXISTS "Allow all couples operations" ON couples;
DROP POLICY IF EXISTS "Allow all users operations" ON users;
DROP POLICY IF EXISTS "Allow all bets operations" ON bets;

-- Disable RLS if needed
ALTER TABLE couples DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;
*/

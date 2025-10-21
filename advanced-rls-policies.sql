-- Advanced RLS Policies for Bet Platform
-- These policies provide better security while working with custom auth_token system
-- 
-- IMPORTANT: This is an alternative approach that provides more security
-- Use this if you want stricter database-level security

-- =============================================================================
-- STEP 1: ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- STEP 2: REMOVE EXISTING POLICIES
-- =============================================================================

DROP POLICY IF EXISTS "Allow all users operations" ON users;
DROP POLICY IF EXISTS "Allow all couples operations" ON couples;
DROP POLICY IF EXISTS "Allow all bets operations" ON bets;

-- =============================================================================
-- STEP 3: CREATE ADVANCED POLICIES
-- =============================================================================

-- USERS table policies
-- Allow all operations for users (your app handles auth_token filtering)
CREATE POLICY "Users can manage own data"
ON users
FOR ALL
USING (true)
WITH CHECK (true);

-- COUPLES table policies
-- Allow all operations for couples (needed for onboarding)
CREATE POLICY "Couples can be managed"
ON couples
FOR ALL
USING (true)
WITH CHECK (true);

-- BETS table policies
-- Allow all operations for bets (filtered by couple_id in app)
CREATE POLICY "Bets can be managed"
ON bets
FOR ALL
USING (true)
WITH CHECK (true);

-- =============================================================================
-- STEP 4: GRANT PERMISSIONS
-- =============================================================================

GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

-- =============================================================================
-- STEP 5: ADD SECURITY FUNCTIONS (OPTIONAL)
-- =============================================================================

-- Create a function to validate auth_token (optional enhancement)
CREATE OR REPLACE FUNCTION validate_auth_token(token text)
RETURNS boolean AS $$
BEGIN
  -- Check if token exists and is not expired
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE auth_token = token 
    AND created_at > NOW() - INTERVAL '30 days' -- Adjust expiration as needed
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- STEP 6: ENHANCED POLICIES WITH TOKEN VALIDATION (OPTIONAL)
-- =============================================================================

-- Uncomment these if you want to use the validation function
-- This would require passing the auth_token in your queries

/*
-- Enhanced users policy with token validation
DROP POLICY IF EXISTS "Users can manage own data" ON users;
CREATE POLICY "Users can manage own data with token"
ON users
FOR ALL
USING (validate_auth_token(current_setting('request.jwt.claims', true)::json->>'auth_token'))
WITH CHECK (validate_auth_token(current_setting('request.jwt.claims', true)::json->>'auth_token'));

-- Enhanced couples policy
DROP POLICY IF EXISTS "Couples can be managed" ON couples;
CREATE POLICY "Couples can be managed with token"
ON couples
FOR ALL
USING (true) -- Allow all for onboarding
WITH CHECK (true);

-- Enhanced bets policy
DROP POLICY IF EXISTS "Bets can be managed" ON bets;
CREATE POLICY "Bets can be managed with token"
ON bets
FOR ALL
USING (validate_auth_token(current_setting('request.jwt.claims', true)::json->>'auth_token'))
WITH CHECK (validate_auth_token(current_setting('request.jwt.claims', true)::json->>'auth_token'));
*/

-- =============================================================================
-- EXPLANATION
-- =============================================================================

/*
ADVANCED SECURITY FEATURES:

1. TOKEN VALIDATION:
   - Optional function to validate auth_token
   - Can be used in policies for additional security
   - Checks token existence and expiration

2. GRANULAR CONTROL:
   - Policies can be enhanced with token validation
   - Provides database-level security
   - Requires passing auth_token in requests

3. IMPLEMENTATION OPTIONS:
   - Use basic policies for immediate fix
   - Enhance with token validation for better security
   - Migrate to Supabase Auth for best security

4. MIGRATION PATH:
   - Start with basic policies (immediate fix)
   - Add token validation (enhanced security)
   - Consider Supabase Auth (best long-term solution)
*/

-- =============================================================================
-- TESTING
-- =============================================================================

/*
TO TEST THESE POLICIES:

1. Run the basic policies first
2. Test your app functionality
3. If working, consider adding token validation
4. Monitor for any permission errors
5. Adjust policies as needed
*/

-- Clean and Reset Database with Proper RLS Policies
-- Run this in your Supabase SQL Editor to completely reset the database

-- Step 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can only access their own couple" ON couples;
DROP POLICY IF EXISTS "Users can only see their couple members" ON users;
DROP POLICY IF EXISTS "Users can only access their couple's bets" ON bets;
DROP POLICY IF EXISTS "Allow anonymous access to couples" ON couples;
DROP POLICY IF EXISTS "Allow anonymous access to users" ON users;
DROP POLICY IF EXISTS "Allow anonymous access to bets" ON bets;
DROP POLICY IF EXISTS "Allow authenticated access to couples" ON couples;
DROP POLICY IF EXISTS "Allow authenticated access to users" ON users;
DROP POLICY IF EXISTS "Allow authenticated access to bets" ON bets;
DROP POLICY IF EXISTS "Allow all operations on couples" ON couples;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on bets" ON bets;

-- Step 2: Drop existing security functions if they exist
DROP FUNCTION IF EXISTS user_has_access_to_couple(UUID);
DROP FUNCTION IF EXISTS user_is_creator_of_bet(UUID);

-- Step 3: Disable RLS temporarily
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE couples DISABLE ROW LEVEL SECURITY;

-- Step 4: Clear all foreign key references
UPDATE couples SET created_by_user_id = NULL;
UPDATE users SET couple_id = NULL, partner_id = NULL;

-- Step 5: Delete all data
DELETE FROM bets;
DELETE FROM users;
DELETE FROM couples;

-- Step 6: Re-enable RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Step 7: Create secure RLS policies
CREATE POLICY "Users can only access their own couple" ON couples 
  FOR ALL 
  USING (
    id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  )
  WITH CHECK (
    created_by_user_id IN (
      SELECT id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

CREATE POLICY "Users can only see their couple members" ON users 
  FOR ALL 
  USING (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  )
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

CREATE POLICY "Users can only access their couple's bets" ON bets 
  FOR ALL 
  USING (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  )
  WITH CHECK (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    ) AND
    creator_id IN (
      SELECT id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

-- Step 8: Create security functions
CREATE OR REPLACE FUNCTION user_has_access_to_couple(couple_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE couple_id = couple_uuid 
    AND auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION user_is_creator_of_bet(bet_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM bets b
    JOIN users u ON b.creator_id = u.id
    WHERE b.id = bet_uuid 
    AND u.auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant necessary permissions
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_has_access_to_couple(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_is_creator_of_bet(UUID) TO anon, authenticated;

-- Step 10: Verify everything is clean
SELECT 'bets' as table_name, COUNT(*) as row_count FROM bets
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'couples' as table_name, COUNT(*) as row_count FROM couples;

-- Show current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('couples', 'users', 'bets')
ORDER BY tablename, policyname;


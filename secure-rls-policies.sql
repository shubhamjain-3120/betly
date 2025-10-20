-- Secure RLS Policies for Multi-Couple Support
-- Run this in your Supabase SQL Editor to replace the insecure policies

-- Drop existing insecure policies
DROP POLICY IF EXISTS "Allow anonymous access to couples" ON couples;
DROP POLICY IF EXISTS "Allow anonymous access to users" ON users;
DROP POLICY IF EXISTS "Allow anonymous access to bets" ON bets;
DROP POLICY IF EXISTS "Allow authenticated access to couples" ON couples;
DROP POLICY IF EXISTS "Allow authenticated access to users" ON users;
DROP POLICY IF EXISTS "Allow authenticated access to bets" ON bets;
DROP POLICY IF EXISTS "Allow all operations on couples" ON couples;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on bets" ON bets;

-- Create secure policies that enforce couple-based data isolation

-- Couples table: Users can only access couples they belong to
CREATE POLICY "Users can only access their own couple" ON couples 
  FOR ALL 
  USING (
    id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  )
  WITH CHECK (
    -- Allow creation if user is creating their own couple
    created_by_user_id IN (
      SELECT id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

-- Users table: Users can only see users in their couple
CREATE POLICY "Users can only see their couple members" ON users 
  FOR ALL 
  USING (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  )
  WITH CHECK (
    -- Allow creation if user is joining their couple
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

-- Bets table: Users can only access bets from their couple
CREATE POLICY "Users can only access their couple's bets" ON bets 
  FOR ALL 
  USING (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  )
  WITH CHECK (
    -- Allow creation if user is in the couple and is the creator
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    ) AND
    creator_id IN (
      SELECT id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

-- Create function to validate user access to couple
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

-- Create function to validate user is creator of bet
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

-- Grant necessary permissions
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant execute permissions on security functions
GRANT EXECUTE ON FUNCTION user_has_access_to_couple(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION user_is_creator_of_bet(UUID) TO anon, authenticated;


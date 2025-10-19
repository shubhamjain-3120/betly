-- Multi-Couple Support Database Migration
-- Run this in your Supabase SQL Editor

-- 1. Create couples table
CREATE TABLE couples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_code TEXT UNIQUE NOT NULL, -- 6-character code like "ABC123"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id)
);

-- 2. Add new columns to users table
ALTER TABLE users ADD COLUMN couple_id UUID REFERENCES couples(id);
ALTER TABLE users ADD COLUMN auth_token TEXT;
ALTER TABLE users ADD COLUMN is_paired BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN partner_id UUID REFERENCES users(id);

-- 3. Add couple_id to bets table
ALTER TABLE bets ADD COLUMN couple_id UUID REFERENCES couples(id);

-- 4. Create indexes for better performance
CREATE INDEX idx_users_couple_id ON users(couple_id);
CREATE INDEX idx_users_auth_token ON users(auth_token);
CREATE INDEX idx_users_partner_id ON users(partner_id);
CREATE INDEX idx_bets_couple_id ON bets(couple_id);
CREATE UNIQUE INDEX idx_couples_code ON couples(couple_code);

-- 5. Update RLS policies for data isolation
-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on bets" ON bets;

-- Create new policies with couple isolation
CREATE POLICY "Users can only see their own couple data" ON users 
  FOR ALL USING (
    auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token' OR
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

CREATE POLICY "Bets are isolated by couple" ON bets 
  FOR ALL USING (
    couple_id IN (
      SELECT couple_id FROM users 
      WHERE auth_token = current_setting('request.jwt.claims', true)::json->>'auth_token'
    )
  );

-- 6. Create function to generate couple codes
CREATE OR REPLACE FUNCTION generate_couple_code() RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 6-character code with letters and numbers
    code := upper(substring(md5(random()::text) from 1 for 6));
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_count FROM couples WHERE couple_code = code;
    -- If code doesn't exist, return it
    IF exists_count = 0 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. Create function to validate couple pairing
CREATE OR REPLACE FUNCTION can_join_couple(couple_code_param TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
  couple_exists BOOLEAN;
  member_count INTEGER;
BEGIN
  -- Check if couple exists
  SELECT EXISTS(SELECT 1 FROM couples WHERE couple_code = couple_code_param) INTO couple_exists;
  
  IF NOT couple_exists THEN
    RETURN FALSE;
  END IF;
  
  -- Check if couple has space (only 1 member allowed)
  SELECT COUNT(*) INTO member_count 
  FROM users 
  WHERE couple_id = (SELECT id FROM couples WHERE couple_code = couple_code_param);
  
  RETURN member_count = 1;
END;
$$ LANGUAGE plpgsql;

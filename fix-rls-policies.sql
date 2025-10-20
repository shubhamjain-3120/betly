-- Fix RLS Policies for Multi-Couple Support
-- Run this in your Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on couples" ON couples;
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on bets" ON bets;

-- Create proper RLS policies for anonymous access
-- This allows the app to work without authentication for now

-- Couples table - allow all operations for anonymous users
CREATE POLICY "Allow anonymous access to couples" ON couples 
  FOR ALL 
  TO anon 
  USING (true) 
  WITH CHECK (true);

-- Users table - allow all operations for anonymous users  
CREATE POLICY "Allow anonymous access to users" ON users 
  FOR ALL 
  TO anon 
  USING (true) 
  WITH CHECK (true);

-- Bets table - allow all operations for anonymous users
CREATE POLICY "Allow anonymous access to bets" ON bets 
  FOR ALL 
  TO anon 
  USING (true) 
  WITH CHECK (true);

-- Also create policies for authenticated users (for future use)
CREATE POLICY "Allow authenticated access to couples" ON couples 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to users" ON users 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to bets" ON bets 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Ensure tables are accessible
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;


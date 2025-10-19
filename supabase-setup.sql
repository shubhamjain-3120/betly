-- Bet Platform Database Schema (Multi-Couple Support)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Couples table
CREATE TABLE couples (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_code TEXT UNIQUE NOT NULL, -- 6-character code like "ABC123"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by_user_id UUID REFERENCES users(id)
);

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0,
  couple_id UUID REFERENCES couples(id),
  auth_token TEXT,
  is_paired BOOLEAN DEFAULT false,
  partner_id UUID REFERENCES users(id)
);

-- Bets table
CREATE TABLE bets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  creator_choice TEXT CHECK (creator_choice IN ('a', 'b')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'concluded')) DEFAULT 'active',
  winner_option TEXT CHECK (winner_option IN ('a', 'b')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluded_at TIMESTAMP WITH TIME ZONE,
  concluded_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  couple_id UUID REFERENCES couples(id)
);

-- Create indexes for better performance
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_creator_id ON bets(creator_id);
CREATE INDEX idx_bets_created_at ON bets(created_at);
CREATE INDEX idx_bets_concluded_at ON bets(concluded_at);
CREATE INDEX idx_users_couple_id ON users(couple_id);
CREATE INDEX idx_users_auth_token ON users(auth_token);
CREATE INDEX idx_users_partner_id ON users(partner_id);
CREATE INDEX idx_bets_couple_id ON bets(couple_id);
CREATE UNIQUE INDEX idx_couples_code ON couples(couple_code);

-- Enable Row Level Security (RLS)
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (simplified for now - will be enhanced with proper auth)
CREATE POLICY "Allow all operations on couples" ON couples FOR ALL USING (true);
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on bets" ON bets FOR ALL USING (true);

-- Create first couple for existing hardcoded users
INSERT INTO couples (id, couple_code, created_by_user_id) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'COUPLE1', '00000000-0000-0000-0000-000000000001');

-- Insert sample users with couple relationship
INSERT INTO users (id, name, couple_id, auth_token, is_paired, partner_id) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'You', '00000000-0000-0000-0000-000000000000', 'token_user1', true, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000002', 'Your Girlfriend', '00000000-0000-0000-0000-000000000000', 'token_user2', true, '00000000-0000-0000-0000-000000000001');

-- Grant necessary permissions
GRANT ALL ON couples TO anon, authenticated;
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

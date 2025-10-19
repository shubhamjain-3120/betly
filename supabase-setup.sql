-- Bet Platform Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0
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
  status TEXT CHECK (status IN ('pending', 'active', 'concluded')) DEFAULT 'pending',
  winner_option TEXT CHECK (winner_option IN ('a', 'b')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluded_at TIMESTAMP WITH TIME ZONE,
  concluded_by_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_creator_id ON bets(creator_id);
CREATE INDEX idx_bets_created_at ON bets(created_at);
CREATE INDEX idx_bets_concluded_at ON bets(concluded_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- For now, allow all operations (we'll restrict this later with proper auth)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on bets" ON bets FOR ALL USING (true);

-- Insert sample users (replace with actual user creation later)
INSERT INTO users (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'You'),
  ('00000000-0000-0000-0000-000000000002', 'Your Girlfriend');

-- Grant necessary permissions
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON bets TO anon, authenticated;

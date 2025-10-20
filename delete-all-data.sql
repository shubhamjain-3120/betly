-- Delete All Data from Bet Platform Database
-- Run this in your Supabase SQL Editor to clear all existing data
-- WARNING: This will permanently delete ALL data in your database

-- Disable RLS temporarily to allow deletion
ALTER TABLE bets DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE couples DISABLE ROW LEVEL SECURITY;

-- First, clear all foreign key references by setting them to NULL
-- This allows us to delete the referenced records
UPDATE couples SET created_by_user_id = NULL;
UPDATE users SET couple_id = NULL, partner_id = NULL;

-- Now delete all data in the correct order (respecting foreign key constraints)
DELETE FROM bets;
DELETE FROM users;
DELETE FROM couples;

-- Re-enable RLS
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Verify tables are empty
SELECT 'bets' as table_name, COUNT(*) as row_count FROM bets
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'couples' as table_name, COUNT(*) as row_count FROM couples;

-- Reset sequences to start from 1 (if any exist)
-- Note: UUID sequences don't need reset, but this is here for completeness

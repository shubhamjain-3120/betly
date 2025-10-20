-- Simple Database Reset
-- Run this in your Supabase SQL Editor to safely reset the database

-- Step 1: Just delete the data (simplest approach)
DELETE FROM bets;
DELETE FROM users; 
DELETE FROM couples;

-- Step 2: Verify tables are empty
SELECT 'bets' as table_name, COUNT(*) as row_count FROM bets
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'couples' as table_name, COUNT(*) as row_count FROM couples;


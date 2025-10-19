-- Remove streak functionality from the database
-- Run this in your Supabase SQL Editor

-- Remove the current_streak column from users table
ALTER TABLE users DROP COLUMN IF EXISTS current_streak;

-- Verify the column has been removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public';

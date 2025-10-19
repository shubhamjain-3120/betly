-- Migration script for existing hardcoded users
-- Run this AFTER running database-migration-multi-couple.sql

-- Create first couple for existing hardcoded users
INSERT INTO couples (id, couple_code, created_by_user_id)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'COUPLE1',
  '00000000-0000-0000-0000-000000000001'
);

-- Generate auth tokens for existing users
UPDATE users SET 
  auth_token = 'token_' || id::text,
  couple_id = '00000000-0000-0000-0000-000000000000',
  is_paired = true,
  partner_id = CASE 
    WHEN id = '00000000-0000-0000-0000-000000000001' 
    THEN '00000000-0000-0000-0000-000000000002'
    ELSE '00000000-0000-0000-0000-000000000001'
  END
WHERE id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

-- Update existing bets to belong to the first couple
UPDATE bets SET couple_id = '00000000-0000-0000-0000-000000000000';

-- Verify migration
SELECT 
  u.name, 
  u.auth_token, 
  u.is_paired, 
  p.name as partner_name,
  c.couple_code
FROM users u
LEFT JOIN users p ON u.partner_id = p.id
LEFT JOIN couples c ON u.couple_id = c.id
WHERE u.id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002'
);

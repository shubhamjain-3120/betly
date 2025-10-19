# Multi-Couple Support Setup Guide

This guide will help you set up the bet platform with multi-couple support, allowing multiple couples to use the app independently.

## Overview

The app now supports:
- Multiple couples with unique pairing codes
- Simple onboarding flow for new users
- Data isolation between couples
- Partner linking/unlinking functionality
- No email/password required - just simple token-based auth

## Database Setup

### 1. Run the Database Migration

First, run the main database migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: database-migration-multi-couple.sql
```

This will:
- Create the `couples` table
- Add new columns to `users` and `bets` tables
- Create necessary indexes
- Set up RLS policies

### 2. Migrate Existing Data

If you have existing data, run the migration script:

```sql
-- Run this in your Supabase SQL Editor
-- File: migration-existing-data.sql
```

This will:
- Create the first couple for existing hardcoded users
- Generate auth tokens for existing users
- Link existing bets to the first couple

### 3. Update Your Supabase Setup

Replace your current `supabase-setup.sql` with the updated version that includes multi-couple support.

## App Features

### Onboarding Flow

**New Users:**
1. **Welcome Screen** - Choose to create or join a couple
2. **Create Couple** - Enter name, get unique 6-character code, share with partner
3. **Join Couple** - Enter name and partner's code to join existing couple

**Existing Users:**
- Automatically logged in with existing auth tokens
- No changes to current experience

### Data Isolation

- Each couple's data is completely isolated
- Bets, stats, and history are filtered by `couple_id`
- No cross-couple data visibility

### Partner Management

**Settings Screen:**
- View current partner information
- Change your name
- Unlink from partner (allows joining new couple)
- Logout functionality

**Unlinking Process:**
- Preserves betting history
- Allows joining new couple
- Partner can also unlink independently

## Key Files Added/Updated

### New Files:
- `lib/auth.ts` - Authentication and token management
- `lib/coupleCode.ts` - Couple code generation and validation
- `app/(onboarding)/welcome.tsx` - Welcome screen
- `app/(onboarding)/create-couple.tsx` - Create couple flow
- `app/(onboarding)/join-couple.tsx` - Join couple flow
- `database-migration-multi-couple.sql` - Database schema changes
- `migration-existing-data.sql` - Migrate existing data

### Updated Files:
- `App.tsx` - Added auth routing and onboarding flow
- `lib/supabase.ts` - Added couple_id filtering and new types
- `app/tabs/index.tsx` - Filter bets by couple_id
- `app/tabs/create.tsx` - Include couple_id when creating bets
- `app/tabs/history.tsx` - Filter history by couple_id
- `app/tabs/settings.tsx` - Partner management and unlink functionality
- `supabase-setup.sql` - Updated with multi-couple schema

## Dependencies Added

```bash
npm install @react-native-async-storage/async-storage @react-navigation/stack
```

## User Experience

### For New Couples:
1. Download app
2. One partner creates couple account → gets code
3. Share code with partner
4. Partner joins using code
5. Start betting together!

### For Existing Users:
- No changes to current experience
- Existing data preserved
- Can unlink and re-pair if needed

## Testing the Multi-Couple Feature

### Test Scenario 1: New Couple
1. Clear app data (or use different device)
2. Open app → should see Welcome screen
3. Create couple account → get code
4. Use different device/session to join with code
5. Verify data isolation

### Test Scenario 2: Existing Users
1. Open app with existing data
2. Should go directly to Home screen
3. All existing bets and stats should be visible
4. Settings should show partner info

### Test Scenario 3: Unlink/Re-pair
1. Go to Settings
2. Unlink from partner
3. Should return to Welcome screen
4. Can create new couple or join existing one

## Database Schema

### New Tables:
- `couples` - Stores couple information and unique codes
- Updated `users` - Added couple_id, auth_token, is_paired, partner_id
- Updated `bets` - Added couple_id for data isolation

### Key Relationships:
- Users belong to one couple (couple_id)
- Users can have one partner (partner_id)
- Bets belong to one couple (couple_id)
- Complete data isolation between couples

## Security Considerations

- Auth tokens stored in AsyncStorage
- No password complexity required
- Data isolation via RLS policies
- Couple codes are unique and hard to guess
- Users can only see their own couple's data

## Future Enhancements

- Deep linking for invite codes
- Push notifications for new bets
- Public leaderboards (optional)
- Multiple partner support
- Bet categories and tags

## Troubleshooting

### Common Issues:

1. **App shows Welcome screen for existing users**
   - Check if auth tokens are properly stored
   - Verify database migration completed successfully

2. **Cannot join couple**
   - Verify couple code is correct (6 characters, uppercase)
   - Check if couple already has 2 members
   - Ensure couple exists in database

3. **Data not showing**
   - Verify couple_id is set correctly
   - Check RLS policies
   - Ensure user is properly authenticated

4. **Partner not showing in Settings**
   - Check if both users have is_paired=true
   - Verify partner_id is set correctly
   - Ensure both users are in same couple

### Debug Steps:
1. Check console logs for auth errors
2. Verify database queries include couple_id filters
3. Test with fresh app install
4. Check Supabase logs for RLS policy violations

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all database migrations completed successfully
3. Test with a fresh app installation
4. Ensure all dependencies are installed correctly

The multi-couple support transforms your bet platform from a single-couple app to a scalable platform that can support unlimited couples worldwide! 🌍💕

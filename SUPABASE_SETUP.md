# Supabase Setup Guide

Follow these steps to set up your Supabase backend for the betly app.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Name**: `bet-platform`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait for the project to be ready (2-3 minutes)

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase-setup.sql` file
4. Click "Run" to execute the schema

## 4. Update App Configuration

1. Open `lib/supabase.ts` in your project
2. Replace the placeholder values:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'; // Replace with your Project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'; // Replace with your anon key
```

## 5. Test the Connection

1. Start your app: `npm start`
2. Open in Expo Go
3. Try creating a bet to test the database connection

## 6. Database Tables Created

### Users Table
- `id` (UUID, Primary Key)
- `name` (Text)
- `created_at` (Timestamp)
- `current_streak` (Integer, default 0)

### Bets Table
- `id` (UUID, Primary Key)
- `title` (Text)
- `amount` (Integer, in paise/rupees)
- `option_a` (Text)
- `option_b` (Text)
- `creator_id` (UUID, Foreign Key to users)
- `creator_choice` (Text: 'a' or 'b')
- `status` (Text: 'pending', 'active', 'concluded')
- `winner_option` (Text: 'a' or 'b', nullable)
- `created_at` (Timestamp)
- `concluded_at` (Timestamp, nullable)
- `concluded_by_id` (UUID, Foreign Key to users, nullable)

## 7. Sample Data

The setup script creates two sample users:
- "You" (ID: 00000000-0000-0000-0000-000000000001)
- "Your Girlfriend" (ID: 00000000-0000-0000-0000-000000000002)

## 8. Security Notes

- Row Level Security (RLS) is enabled
- Currently allows all operations (for development)
- Will be restricted when proper authentication is implemented

## 9. Troubleshooting

### Common Issues:

1. **"Invalid API key" error**
   - Double-check your anon key in `lib/supabase.ts`
   - Make sure there are no extra spaces

2. **"Failed to load bets" error**
   - Check if the database schema was created successfully
   - Verify the table names match exactly

3. **"Permission denied" error**
   - Check if RLS policies are set up correctly
   - Verify the anon key has the right permissions

### Debug Steps:

1. Check Supabase dashboard → **Table Editor** to see if tables exist
2. Check **Logs** in Supabase dashboard for any errors
3. Use **SQL Editor** to run test queries:
   ```sql
   SELECT * FROM users;
   SELECT * FROM bets;
   ```

## 10. Next Steps

Once Supabase is set up:
1. Test creating a bet
2. Test approving/declining bets
3. Test concluding bets
4. Check the leaderboard updates
5. Implement proper user authentication
6. Add real-time subscriptions

## Support

If you encounter issues:
1. Check the Supabase documentation
2. Review the app logs in Expo Go
3. Check the Supabase dashboard logs
4. Verify your network connection

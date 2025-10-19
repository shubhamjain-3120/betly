# Bet Platform - iOS App

A fun betting platform for couples to track friendly wagers and maintain a competitive leaderboard.

## Features

- **Create Bets**: Set up bets with title, amount (₹), and two options
- **Approve/Decline**: Review and approve pending bets from your partner
- **Active Bets**: Track ongoing bets with pull-to-refresh functionality
- **Conclude Bets**: Either person can conclude a bet by selecting the winner
- **Leaderboard**: Track wins, amounts, win rates, and current streaks
- **History**: View detailed history of all concluded bets

## Tech Stack

- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: Supabase (PostgreSQL database)
- **Navigation**: React Navigation with bottom tabs
- **Currency**: Indian Rupees (₹)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- iOS Simulator or physical iOS device
- Supabase account (for database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Supabase (Quick Setup):
   ```bash
   # Run the interactive setup script
   node setup-supabase.js
   ```
   
   Or manually:
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Copy `config.example.ts` to `config.ts` and fill in your credentials
   - Run the SQL schema in your Supabase SQL Editor (see `supabase-setup.sql`)

4. Start the development server:
   ```bash
   npm start
   ```

5. Open the app in Expo Go on your iOS device or iOS Simulator

## Database Setup

### Tables

#### Users Table
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  current_streak INTEGER DEFAULT 0
);
```

#### Bets Table
```sql
CREATE TABLE bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount INTEGER NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  creator_id UUID REFERENCES users(id),
  creator_choice TEXT CHECK (creator_choice IN ('a', 'b')),
  status TEXT CHECK (status IN ('pending', 'active', 'concluded')) DEFAULT 'pending',
  winner_option TEXT CHECK (winner_option IN ('a', 'b')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  concluded_at TIMESTAMP WITH TIME ZONE,
  concluded_by_id UUID REFERENCES users(id)
);
```

## App Structure

```
/
├── app/
│   └── (tabs)/
│       ├── index.tsx          // Active Bets (Home)
│       ├── pending.tsx       // Pending Approval
│       ├── create.tsx         // Create New Bet
│       ├── history.tsx        // Concluded Bets
│       └── leaderboard.tsx    // Scores & Stats
├── components/               // Reusable components
├── lib/
│   └── supabase.ts           // Supabase client & types
└── types/
    └── database.types.ts     // TypeScript database types
```

## Features in Detail

### Bet Creation Flow
1. User enters bet title, amount (₹), and two options
2. User selects which option they're betting on (A or B)
3. Bet is created in "pending" status
4. Other user can approve (automatically gets opposite option) or decline

### Bet Approval
- Pending bets show creator's choice
- Approver automatically gets the opposite option
- Declined bets are permanently deleted

### Active Bets
- Main screen showing all active bets
- Pull-to-refresh to reload
- Tap bet card to see details and conclude option

### Concluding Bets
- Either person can conclude from bet details modal
- Select winning option (A or B)
- First person to conclude wins (no disputes)
- Updates leaderboard automatically

### Leaderboard
- Total wins, amounts won, win rates
- Current streak (consecutive wins)
- Recent activity feed

## Development Notes

- Currently uses mock user data (will be updated with proper authentication)
- Supabase configuration needed in `lib/supabase.ts`
- All amounts displayed in Indian Rupees (₹)
- Optimized for iOS with native feel

## Next Steps

1. Set up Supabase project and database
2. Implement proper user authentication
3. Add real-time updates with Supabase subscriptions
4. Polish UI/UX with animations
5. Test on physical iOS devices
6. Deploy via EAS Build

## License

Private project for personal use.

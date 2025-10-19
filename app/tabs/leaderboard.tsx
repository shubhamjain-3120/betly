import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { supabase, Bet } from '../../lib/supabase';

interface UserStats {
  id: string;
  name: string;
  totalWins: number;
  totalAmount: number;
  winRate: number;
  currentStreak: number;
}

export default function LeaderboardScreen() {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [recentBets, setRecentBets] = useState<Bet[]>([]);

  const loadStats = async () => {
    try {
      // Load users and concluded bets
      const [usersResult, betsResult] = await Promise.all([
        supabase.from('users').select('id, name'),
        supabase.from('bets').select('*').eq('status', 'concluded').order('concluded_at', { ascending: false })
      ]);

      if (usersResult.error) throw usersResult.error;
      if (betsResult.error) throw betsResult.error;

      const users = usersResult.data || [];
      const concludedBets = betsResult.data || [];

      // Create user stats with actual names
      const userStats: UserStats[] = users.map(user => ({
        id: user.id,
        name: user.name,
        totalWins: 0,
        totalAmount: 0,
        winRate: 0,
        currentStreak: 0,
      }));

      // Calculate stats from concluded bets
      if (concludedBets.length > 0) {
        concludedBets.forEach((bet) => {
          const creatorWon = bet.winner_option === bet.creator_choice;
          const winnerIndex = creatorWon ? 0 : 1;
          const loserIndex = creatorWon ? 1 : 0;

          // Update winner stats
          if (userStats[winnerIndex]) {
            userStats[winnerIndex].totalWins += 1;
            userStats[winnerIndex].totalAmount += bet.amount;
            userStats[winnerIndex].currentStreak += 1;
          }
          
          // Reset loser streak
          if (userStats[loserIndex]) {
            userStats[loserIndex].currentStreak = 0;
          }
        });

        // Calculate win rates
        const totalBets = concludedBets.length;
        userStats.forEach((user) => {
          user.winRate = totalBets > 0 ? (user.totalWins / totalBets) * 100 : 0;
        });
      }

      setUserStats(userStats);
      setRecentBets(concludedBets.slice(0, 5));
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load leaderboard');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    });
  };

  const renderUserCard = (user: UserStats, index: number) => (
    <View style={[styles.userCard, index === 0 && styles.winnerCard]}>
      <View style={styles.userHeader}>
        <Text style={styles.userRank}>#{index + 1}</Text>
        <Text style={styles.userName}>{user.name}</Text>
        {index === 0 && <Text style={styles.winnerBadge}>👑</Text>}
      </View>
      
      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.totalWins}</Text>
          <Text style={styles.statLabel}>Wins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{user.totalAmount}</Text>
          <Text style={styles.statLabel}>Won</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.winRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>
    </View>
  );

  const renderRecentBet = ({ item }: { item: Bet }) => (
    <View style={styles.recentBetCard}>
      <Text style={styles.recentBetTitle}>{item.title}</Text>
      <Text style={styles.recentBetAmount}>₹{item.amount}</Text>
      <Text style={styles.recentBetDate}>
        {formatDate(item.concluded_at || '')}
      </Text>
    </View>
  );

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.leaderboardSection}>
        <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
        {userStats.map((user, index) => renderUserCard(user, index))}
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>📈 Recent Activity</Text>
        {recentBets.length > 0 ? (
          recentBets.map((bet) => (
            <View key={bet.id} style={styles.recentBetCard}>
              <Text style={styles.recentBetTitle}>{bet.title}</Text>
              <Text style={styles.recentBetAmount}>₹{bet.amount}</Text>
              <Text style={styles.recentBetDate}>
                {formatDate(bet.concluded_at || '')}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent activity</Text>
            <Text style={styles.emptyStateSubtext}>Start betting to see your progress!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  leaderboardSection: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  userCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  winnerCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#FFFACD',
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  winnerBadge: {
    fontSize: 20,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recentSection: {
    margin: 15,
  },
  recentBetCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recentBetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  recentBetAmount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 10,
  },
  recentBetDate: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
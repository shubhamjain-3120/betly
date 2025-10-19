import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, Bet } from '../../lib/supabase';

interface UserStats {
  id: string;
  name: string;
  totalWins: number;
  totalAmount: number;
  winRate: number;
  currentStreak: number;
}

export default function HistoryScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<'stats' | 'history'>('stats');

  const loadAllData = async () => {
    try {
      // Get current couple ID
      const { getCurrentCoupleId } = await import('../../lib/supabase');
      const coupleId = await getCurrentCoupleId();
      
      if (!coupleId) {
        console.error('No couple ID found');
        return;
      }

      // Load users and concluded bets for current couple
      const [usersResult, betsResult] = await Promise.all([
        supabase.from('users').select('id, name').eq('couple_id', coupleId),
        supabase.from('bets').select('*').eq('status', 'concluded').eq('couple_id', coupleId).order('concluded_at', { ascending: false })
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
      setBets(concludedBets);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load history and stats');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const openBetDetails = (bet: Bet) => {
    setSelectedBet(bet);
    setModalVisible(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWinnerText = (bet: Bet) => {
    if (bet.winner_option === bet.creator_choice) {
      return 'Creator won';
    } else {
      return 'Approver won';
    }
  };

  const getWinnerColor = (bet: Bet) => {
    return bet.winner_option === bet.creator_choice ? '#34C759' : '#FF3B30';
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

  const renderBetCard = (bet: Bet) => (
    <TouchableOpacity key={bet.id} style={styles.betCard} onPress={() => openBetDetails(bet)}>
      <View style={styles.betHeader}>
        <Text style={styles.betTitle}>{bet.title}</Text>
        <Text style={styles.betAmount}>₹{bet.amount}</Text>
      </View>
      
      <View style={styles.betInfo}>
        <Text style={styles.betDate}>
          Concluded: {formatDate(bet.concluded_at || '')}
        </Text>
        <Text style={[styles.winnerText, { color: getWinnerColor(bet) }]}>
          {getWinnerText(bet)}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.optionText}>
          A: {bet.option_a}
        </Text>
        <Text style={styles.optionText}>
          B: {bet.option_b}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStatsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
      {userStats.map((user, index) => renderUserCard(user, index))}
    </View>
  );

  const renderHistorySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📈 Bet History</Text>
      {bets.length > 0 ? (
        bets.map((bet) => renderBetCard(bet))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No concluded bets yet</Text>
          <Text style={styles.emptyStateSubtext}>Start betting to see your history!</Text>
        </View>
      )}
    </View>
  );

  useEffect(() => {
    loadAllData();
  }, []);

  // Refresh data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 History screen focused, refreshing data...');
      loadAllData();
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, activeSection === 'stats' && styles.activeNavButton]}
          onPress={() => setActiveSection('stats')}
        >
          <Text style={[styles.navButtonText, activeSection === 'stats' && styles.activeNavButtonText]}>
            Stats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, activeSection === 'history' && styles.activeNavButton]}
          onPress={() => setActiveSection('history')}
        >
          <Text style={[styles.navButtonText, activeSection === 'history' && styles.activeNavButtonText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {activeSection === 'stats' ? renderStatsSection() : renderHistorySection()}
      </ScrollView>

      {/* Bet Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          {selectedBet && (
            <>
              <Text style={styles.modalTitle}>{selectedBet.title}</Text>
              <Text style={styles.modalAmount}>₹{selectedBet.amount}</Text>
              
              <View style={styles.modalInfo}>
                <Text style={styles.modalInfoText}>
                  Created: {formatDate(selectedBet.created_at)}
                </Text>
                <Text style={styles.modalInfoText}>
                  Concluded: {formatDate(selectedBet.concluded_at || '')}
                </Text>
                <Text style={[styles.modalWinnerText, { color: getWinnerColor(selectedBet) }]}>
                  Winner: {getWinnerText(selectedBet)}
                </Text>
              </View>

              <View style={styles.modalOptions}>
                <Text style={styles.modalOptionText}>
                  Option A: {selectedBet.option_a}
                </Text>
                <Text style={styles.modalOptionText}>
                  Option B: {selectedBet.option_b}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navigationContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeNavButton: {
    backgroundColor: '#007AFF',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeNavButtonText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
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
  betCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  betTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  betAmount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  betInfo: {
    marginBottom: 10,
  },
  betDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  winnerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginTop: 5,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
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
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalAmount: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 20,
  },
  modalInfo: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  modalWinnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  modalOptions: {
    marginBottom: 30,
  },
  modalOptionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#333',
  },
});
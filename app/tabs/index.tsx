import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase, Bet, testSupabaseConnection } from '../../lib/supabase';

export default function HomeScreen() {
  const [activeBets, setActiveBets] = useState<Bet[]>([]);
  const [userStats, setUserStats] = useState({
    totalWins: 0,
    totalAmount: 0,
    winRate: 0,
    currentStreak: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [deletingBetId, setDeletingBetId] = useState<string | null>(null);


  const loadAllData = async () => {
    try {
      console.log('🔄 Loading all data...');
      
      // Get current couple ID
      const { getCurrentCoupleId } = await import('../../lib/supabase');
      const coupleId = await getCurrentCoupleId();
      
      if (!coupleId) {
        console.error('❌ No couple ID found');
        return;
      }

      console.log('💑 Couple ID:', coupleId);

      // Load active bets for current couple
      const { data: activeData, error: activeError } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'active')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });

      if (activeError) {
        console.error('❌ Error loading active bets:', activeError);
        throw activeError;
      }

      console.log('📊 Active bets loaded:', activeData?.length || 0);

      // Load user stats for current couple
      const { data: concludedBets, error: statsError } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'concluded')
        .eq('couple_id', coupleId);

      if (statsError) {
        console.error('❌ Error loading concluded bets:', statsError);
        throw statsError;
      }

      console.log('📈 Concluded bets loaded:', concludedBets?.length || 0);

      // Update state
      setActiveBets(activeData || []);

      // Calculate user stats
      const userWins = concludedBets?.filter(bet => 
        bet.winner_option === bet.creator_choice
      ).length || 0;
      
      const totalAmount = concludedBets?.filter(bet => 
        bet.winner_option === bet.creator_choice
      ).reduce((sum, bet) => sum + bet.amount, 0) || 0;

      const winRate = concludedBets?.length > 0 ? (userWins / concludedBets.length) * 100 : 0;

      setUserStats({
        totalWins: userWins,
        totalAmount: totalAmount,
        winRate: winRate,
        currentStreak: 0, // TODO: Calculate actual streak
      });

      console.log('✅ Data loaded successfully');

    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', `Failed to load data: ${error.message || 'Unknown error'}`);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const concludeBet = async (bet: Bet, winnerOption: 'a' | 'b') => {
    try {
      const { error } = await supabase
        .from('bets')
        .update({
          status: 'concluded',
          winner_option: winnerOption,
          concluded_at: new Date().toISOString(),
          concluded_by_id: '00000000-0000-0000-0000-000000000001', // You
        })
        .eq('id', bet.id);

      if (error) throw error;

      // Update user streaks and scores
      await updateUserStats(bet, winnerOption);
      
      setModalVisible(false);
      setSelectedBet(null);
      loadAllData();
    } catch (error) {
      console.error('Error concluding bet:', error);
      Alert.alert('Error', 'Failed to conclude bet');
    }
  };

  const deleteBet = async (bet: Bet) => {
    try {
      console.log('🗑️ Delete button pressed for bet:', bet.id, bet.title);
      setDeletingBetId(bet.id);
      
      const { data, error } = await supabase
        .from('bets')
        .delete()
        .eq('id', bet.id)
        .select();

      console.log('🗑️ Delete result:', { data, error });

      if (error) {
        console.error('❌ Delete error:', error);
        Alert.alert('Delete Error', error.message);
        return;
      }

      console.log('✅ Bet deleted successfully, updating UI...');
      
      // Remove from local state immediately
      setActiveBets(prevBets => prevBets.filter(b => b.id !== bet.id));
      setForceRefresh(prev => prev + 1);
      
      console.log('✅ Delete completed successfully');
    } catch (error) {
      console.error('❌ Error deleting bet:', error);
      Alert.alert('Delete Error', error.message);
    } finally {
      setDeletingBetId(null);
    }
  };

  const updateUserStats = async (bet: Bet, winnerOption: 'a' | 'b') => {
    // This will be implemented when we have user management
    console.log('Updating user stats for bet:', bet.id, 'winner:', winnerOption);
  };

  const openBetDetails = (bet: Bet) => {
    setSelectedBet(bet);
    setModalVisible(true);
  };

  const renderBetCard = ({ item }: { item: Bet }) => (
    <TouchableOpacity style={styles.betCard} onPress={() => openBetDetails(item)}>
      <Text style={styles.betTitle}>{item.title}</Text>
      <Text style={styles.betAmount}>₹{item.amount}</Text>
      <View style={styles.optionsContainer}>
        <Text style={styles.optionText}>
          A: {item.option_a} {item.creator_choice === 'a' ? '(You)' : ''}
        </Text>
        <Text style={styles.optionText}>
          B: {item.option_b} {item.creator_choice === 'b' ? '(You)' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No active bets</Text>
      <Text style={styles.emptyStateSubtext}>Create your first bet to get started!</Text>
    </View>
  );

  useEffect(() => {
    const initializeApp = async () => {
      // Test Supabase connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        Alert.alert('Connection Error', 'Unable to connect to database. Please check your internet connection.');
        return;
      }
      
      // Load data
      await loadAllData();
    };
    
    initializeApp();
  }, []);

  // Reload data when screen comes into focus (e.g., after creating a bet)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🏠 Home screen focused - reloading data...');
      loadAllData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>Bet Platform</Text>
                </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.totalWins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹{userStats.totalAmount}</Text>
              <Text style={styles.statLabel}>Won</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.winRate.toFixed(1)}%</Text>
              <Text style={styles.statLabel}>Win Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userStats.currentStreak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>


        {/* Active Bets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Bets ({activeBets.length})</Text>
          </View>
          {activeBets.length > 0 ? (
            <>
              {activeBets.slice(0, 3).map((bet) => (
                <View key={`${bet.id}-${forceRefresh}`} style={styles.betCard}>
                  <TouchableOpacity 
                    style={styles.betContent}
                    onPress={() => {
                      setSelectedBet(bet);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={styles.betTitle}>{bet.title}</Text>
                    <Text style={styles.betAmount}>₹{bet.amount}</Text>
                    <View style={styles.betOptions}>
                      <Text style={styles.optionText}>
                        A: {bet.option_a} {bet.creator_choice === 'a' ? '(You)' : ''}
                      </Text>
                      <Text style={styles.optionText}>
                        B: {bet.option_b} {bet.creator_choice === 'b' ? '(You)' : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  
                  {/* Delete button for active bets only */}
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      deletingBetId === bet.id && styles.deleteButtonLoading
                    ]}
                    onPress={() => deleteBet(bet)}
                    disabled={deletingBetId === bet.id}
                  >
                    <Text style={styles.deleteButtonText}>
                      {deletingBetId === bet.id ? 'Deleting...' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                  
                </View>
              ))}
              {activeBets.length > 3 && (
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View all {activeBets.length} active</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active bets</Text>
              <Text style={styles.emptyStateSubtext}>Create your first bet to get started!</Text>
            </View>
          )}
        </View>
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
              
              <View style={styles.modalOptions}>
                <Text style={styles.modalOptionText}>
                  Option A: {selectedBet.option_a}
                </Text>
                <Text style={styles.modalOptionText}>
                  Option B: {selectedBet.option_b}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.optionAButton]}
                  onPress={() => concludeBet(selectedBet, 'a')}
                >
                  <Text style={styles.actionButtonText}>A Won</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.optionBButton]}
                  onPress={() => concludeBet(selectedBet, 'b')}
                >
                  <Text style={styles.actionButtonText}>B Won</Text>
                </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  betCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  betContent: {
    flex: 1,
    padding: 15,
  },
  betTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  betAmount: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  betStatus: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  betOptions: {
    marginTop: 5,
  },
  optionText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  viewAllButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  viewAllText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
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
  modalOptions: {
    marginBottom: 30,
  },
  modalOptionText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  optionAButton: {
    backgroundColor: '#34C759',
  },
  optionBButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 15,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteButtonLoading: {
    backgroundColor: '#FF6B6B',
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
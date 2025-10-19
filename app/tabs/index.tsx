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
} from 'react-native';
import { supabase, Bet, testSupabaseConnection } from '../../lib/supabase';

export default function ActiveBetsScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error loading bets:', error);
      Alert.alert('Error', 'Failed to load bets');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBets();
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
      loadBets();
    } catch (error) {
      console.error('Error concluding bet:', error);
      Alert.alert('Error', 'Failed to conclude bet');
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
    loadBets();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={bets}
        renderItem={renderBetCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={bets.length === 0 ? styles.emptyContainer : undefined}
      />

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
  betCard: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  betTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  betAmount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 10,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
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
});
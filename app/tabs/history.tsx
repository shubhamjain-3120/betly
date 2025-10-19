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
import { supabase, Bet } from '../../lib/supabase';

export default function HistoryScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'concluded')
        .order('concluded_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load bet history');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
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
    // This will be updated when we have proper user management
    return bet.winner_option === bet.creator_choice ? '#34C759' : '#FF3B30';
  };

  const renderBetCard = ({ item }: { item: Bet }) => (
    <TouchableOpacity style={styles.betCard} onPress={() => openBetDetails(item)}>
      <View style={styles.betHeader}>
        <Text style={styles.betTitle}>{item.title}</Text>
        <Text style={styles.betAmount}>₹{item.amount}</Text>
      </View>
      
      <View style={styles.betInfo}>
        <Text style={styles.betDate}>
          Concluded: {formatDate(item.concluded_at || '')}
        </Text>
        <Text style={[styles.winnerText, { color: getWinnerColor(item) }]}>
          {getWinnerText(item)}
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={styles.optionText}>
          A: {item.option_a}
        </Text>
        <Text style={styles.optionText}>
          B: {item.option_b}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No concluded bets yet</Text>
      <Text style={styles.emptyStateSubtext}>Start betting to see your history!</Text>
    </View>
  );

  useEffect(() => {
    loadHistory();
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
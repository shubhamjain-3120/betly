import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { supabase, Bet } from '../../lib/supabase';

export default function PendingScreen() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPendingBets = async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBets(data || []);
    } catch (error) {
      console.error('Error loading pending bets:', error);
      Alert.alert('Error', 'Failed to load pending bets');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingBets();
    setRefreshing(false);
  };

  const approveBet = async (bet: Bet) => {
    try {
      const { error } = await supabase
        .from('bets')
        .update({ status: 'active' })
        .eq('id', bet.id);

      if (error) throw error;

      Alert.alert('Success', 'Bet approved!');
      loadPendingBets();
    } catch (error) {
      console.error('Error approving bet:', error);
      Alert.alert('Error', 'Failed to approve bet');
    }
  };

  const declineBet = async (bet: Bet) => {
    try {
      const { error } = await supabase
        .from('bets')
        .delete()
        .eq('id', bet.id);

      if (error) throw error;

      Alert.alert('Success', 'Bet declined and deleted');
      loadPendingBets();
    } catch (error) {
      console.error('Error declining bet:', error);
      Alert.alert('Error', 'Failed to decline bet');
    }
  };

  const renderBetCard = ({ item }: { item: Bet }) => (
    <View style={styles.betCard}>
      <Text style={styles.betTitle}>{item.title}</Text>
      <Text style={styles.betAmount}>₹{item.amount}</Text>
      
      <View style={styles.optionsContainer}>
        <Text style={styles.optionText}>
          A: {item.option_a}
        </Text>
        <Text style={styles.optionText}>
          B: {item.option_b}
        </Text>
      </View>

      <View style={styles.creatorInfo}>
        <Text style={styles.creatorText}>
          Creator chose: {item.creator_choice === 'a' ? 'A' : 'B'}
        </Text>
        <Text style={styles.creatorText}>
          You will get: {item.creator_choice === 'a' ? 'B' : 'A'}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.approveButton]}
          onPress={() => approveBet(item)}
        >
          <Text style={styles.actionButtonText}>Approve</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.declineButton]}
          onPress={() => declineBet(item)}
        >
          <Text style={styles.actionButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No pending bets</Text>
      <Text style={styles.emptyStateSubtext}>All caught up! 🎉</Text>
    </View>
  );

  useEffect(() => {
    loadPendingBets();
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
    marginBottom: 15,
  },
  optionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  creatorInfo: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  creatorText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  declineButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
});
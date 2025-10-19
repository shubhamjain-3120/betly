import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function CreateBetScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBet = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a bet title');
      return;
    }
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    if (!optionA.trim()) {
      Alert.alert('Error', 'Please enter option A');
      return;
    }
    if (!optionB.trim()) {
      Alert.alert('Error', 'Please enter option B');
      return;
    }
    if (!selectedOption) {
      Alert.alert('Error', 'Please select which option you are betting on');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create bet in Supabase database
      const { data, error } = await supabase
        .from('bets')
        .insert({
          title: title.trim(),
          amount: Number(amount),
          option_a: optionA.trim(),
          option_b: optionB.trim(),
          creator_id: '00000000-0000-0000-0000-000000000001', // You
          creator_choice: selectedOption,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Bet created! Waiting for approval.', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setTitle('');
            setAmount('');
            setOptionA('');
            setOptionB('');
            setSelectedOption(null);
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating bet:', error);
      Alert.alert('Error', 'Failed to create bet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOptionSelector = () => (
    <View style={styles.optionSelector}>
      <Text style={styles.optionSelectorLabel}>Which option are you betting on?</Text>
      <View style={styles.optionButtons}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedOption === 'a' && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedOption('a')}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedOption === 'a' && styles.optionButtonTextSelected,
            ]}
          >
            Option A
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.optionButton,
            selectedOption === 'b' && styles.optionButtonSelected,
          ]}
          onPress={() => setSelectedOption('b')}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedOption === 'b' && styles.optionButtonTextSelected,
            ]}
          >
            Option B
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Bet Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What are you betting on?"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Amount (₹) *</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="500"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Option A *</Text>
          <TextInput
            style={styles.input}
            value={optionA}
            onChangeText={setOptionA}
            placeholder="First option"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Option B *</Text>
          <TextInput
            style={styles.input}
            value={optionB}
            onChangeText={setOptionB}
            placeholder="Second option"
            placeholderTextColor="#999"
          />

          {renderOptionSelector()}

          <TouchableOpacity
            style={[
              styles.createButton,
              isSubmitting && styles.createButtonDisabled,
            ]}
            onPress={handleCreateBet}
            disabled={isSubmitting}
          >
            <Text style={styles.createButtonText}>
              {isSubmitting ? 'Creating...' : 'Create Bet'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  optionSelector: {
    marginTop: 20,
    marginBottom: 30,
  },
  optionSelectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  optionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  optionButtonSelected: {
    backgroundColor: '#007AFF',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
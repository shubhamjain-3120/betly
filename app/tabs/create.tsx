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
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';

export default function CreateBetScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [selectedOption, setSelectedOption] = useState<'a' | 'b' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleCreateBet = async () => {
    console.log('🚀 Create bet button pressed!');
    console.log('📝 Form data:', { title, amount, optionA, optionB, selectedOption });
    
    // Comprehensive input validation
    const { validateTitle, validateAmount, validateOption, validateCreatorChoice } = require('../../lib/validation');
    
    const titleValidation = validateTitle(title);
    if (!titleValidation.isValid) {
      Alert.alert('Error', titleValidation.error);
      return;
    }
    
    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      Alert.alert('Error', amountValidation.error);
      return;
    }
    
    const optionAValidation = validateOption(optionA);
    if (!optionAValidation.isValid) {
      Alert.alert('Error', `Option A: ${optionAValidation.error}`);
      return;
    }
    
    const optionBValidation = validateOption(optionB);
    if (!optionBValidation.isValid) {
      Alert.alert('Error', `Option B: ${optionBValidation.error}`);
      return;
    }
    
    const choiceValidation = validateCreatorChoice(selectedOption || '');
    if (!choiceValidation.isValid) {
      Alert.alert('Error', choiceValidation.error);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user and couple ID
      console.log('🔐 Getting current user...');
      const { getCurrentUser, getStoredAuthToken } = await import('../../lib/auth');
      const { getCurrentCoupleId } = await import('../../lib/supabase');
      
      // Check auth token first
      const authToken = await getStoredAuthToken();
      console.log('🔑 Auth token:', authToken ? 'Present' : 'Missing');
      
      const user = await getCurrentUser();
      const coupleId = await getCurrentCoupleId();
      
      console.log('👤 User:', user);
      console.log('💑 Couple ID:', coupleId);
      
      if (!user || !coupleId) {
        console.error('❌ Authentication failed - user or couple ID missing');
        Alert.alert('Error', 'Please log in again');
        return;
      }

      // Verify user belongs to the couple they're trying to create a bet for
      if (user.couple_id !== coupleId) {
        console.error('❌ Authorization failed - user not in couple');
        Alert.alert('Error', 'You are not authorized to create bets for this couple');
        return;
      }

      // Create bet in Supabase database - immediately active
      console.log('💾 Inserting bet into database...');
      console.log('👤 User ID:', user.id);
      console.log('💑 Couple ID:', coupleId);
      
      const { data, error } = await supabase
        .from('bets')
        .insert({
          title: titleValidation.sanitized,
          amount: amountValidation.sanitized,
          option_a: optionAValidation.sanitized,
          option_b: optionBValidation.sanitized,
          creator_id: user.id,
          creator_choice: choiceValidation.sanitized,
          status: 'active', // Immediately active, no approval needed
          couple_id: coupleId,
        })
        .select();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }
      
      console.log('✅ Bet created successfully:', data);
      console.log('🏠 Navigating to home page...');

      // Reset form immediately after successful creation
      setTitle('');
      setAmount('');
      setOptionA('');
      setOptionB('');
      setSelectedOption(null);
      
      // Navigate to home tab immediately (no confirmation dialog)
      console.log('🏠 Navigating to Home tab...');
      navigation.navigate('Home' as never);
      console.log('✅ Navigation completed');
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
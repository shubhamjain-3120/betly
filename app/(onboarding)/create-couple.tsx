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
  Share,
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { generateCoupleCode } from '../../lib/coupleCode';
import { generateAuthToken } from '../../lib/auth';

export default function CreateCoupleScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [coupleCode, setCoupleCode] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [authToken, setAuthToken] = useState('');

  const handleCreateCouple = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsCreating(true);

    try {
      console.log('🚀 Starting couple creation...');
      
      // Generate unique couple code
      console.log('📝 Generating couple code...');
      const code = await generateCoupleCode();
      console.log('✅ Couple code generated:', code);
      
      // Generate auth token
      console.log('🔑 Generating auth token...');
      const authToken = generateAuthToken();
      console.log('✅ Auth token generated:', authToken.substring(0, 20) + '...');

      // Create couple record
      console.log('💑 Creating couple record...');
      const { data: couples, error: coupleError } = await supabase
        .from('couples')
        .insert({
          couple_code: code,
        })
        .select();

      if (coupleError || !couples || couples.length === 0) {
        console.error('❌ Couple creation failed:', coupleError);
        throw coupleError || new Error('Failed to create couple');
      }

      const couple = couples[0];
      console.log('✅ Couple created:', couple.id);

      // Create user record
      console.log('👤 Creating user record...');
      const { data: users, error: userError } = await supabase
        .from('users')
        .insert({
          name: name.trim(),
          auth_token: authToken,
          couple_id: couple.id,
          is_paired: false,
        })
        .select();

      if (userError || !users || users.length === 0) {
        console.error('❌ User creation failed:', userError);
        throw userError || new Error('Failed to create user');
      }

      const user = users[0];
      console.log('✅ User created:', user.id);

      // Update couple with created_by_user_id
      console.log('🔄 Updating couple with user ID...');
      const { error: updateError } = await supabase
        .from('couples')
        .update({ created_by_user_id: user.id })
        .eq('id', couple.id);

      if (updateError) {
        console.error('❌ Couple update failed:', updateError);
        throw updateError;
      }

      console.log('✅ Couple updated successfully');
      setCoupleCode(code);
      setAuthToken(authToken);
      setShowSuccess(true);
      
      console.log('🎉 Showing success screen...');
    } catch (error) {
      console.error('Error creating couple:', error);
      Alert.alert('Error', 'Failed to create couple account');
    } finally {
      setIsCreating(false);
    }
  };

  const shareCoupleCode = async (code: string) => {
    try {
      await Share.share({
        message: `Join me on Bet Together! Use this code: ${code}`,
        title: 'Join my betting couple!',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const copyCoupleCode = async (code: string) => {
    try {
      await Clipboard.setString(code);
      Alert.alert('Copied!', 'Couple code copied to clipboard');
    } catch (error) {
      console.error('Error copying:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  const handleContinue = async () => {
    try {
      console.log('🚀 Storing auth token and navigating...');
      
      // Store auth token and navigate to app
      const { storeAuthToken } = require('../../lib/auth');
      await storeAuthToken(authToken);
      console.log('✅ Auth token stored, navigating to Home');
      
      // Force a page reload to trigger auth state change
      // This will make App.tsx re-check authentication and show MainApp
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('❌ Error storing auth token:', error);
      Alert.alert('Error', 'Failed to store auth token');
    }
  };

  if (showSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          
          <Text style={styles.successTitle}>Couple Created!</Text>
          <Text style={styles.successSubtitle}>
            Your couple code is:
          </Text>
          
          <View style={styles.codeContainer}>
            <Text style={styles.coupleCode}>{coupleCode}</Text>
          </View>
          
          <Text style={styles.successMessage}>
            Share this code with your partner so they can join!
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => shareCoupleCode(coupleCode)}
            >
              <Text style={styles.shareButtonText}>Share Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyCoupleCode(coupleCode)}
            >
              <Text style={styles.copyButtonText}>Copy Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Create Your Couple</Text>
            <Text style={styles.subtitle}>
              Set up your betting account and invite your partner
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#999"
              autoCapitalize="words"
            />

            <TouchableOpacity
              style={[styles.createButton, isCreating && styles.createButtonDisabled]}
              onPress={handleCreateCouple}
              disabled={isCreating}
            >
              <Text style={styles.createButtonText}>
                {isCreating ? 'Creating...' : 'Create Couple Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoTitle}>What happens next?</Text>
            <Text style={styles.infoText}>
              • You'll get a unique 6-character code{'\n'}
              • Share this code with your partner{'\n'}
              • They'll use it to join your couple{'\n'}
              • Start betting together! 💕
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 30,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#e3f2fd',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#f8f9fa',
  },
  successIcon: {
    marginBottom: 30,
  },
  successEmoji: {
    fontSize: 80,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  codeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginBottom: 30,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  coupleCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    letterSpacing: 4,
  },
  successMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  shareButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  copyButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

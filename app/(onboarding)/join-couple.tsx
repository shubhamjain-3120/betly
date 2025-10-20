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
  Clipboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { canJoinCouple, canRejoinCouple, isValidCoupleCode } from '../../lib/coupleCode';
import { generateAuthToken, getStoredAuthToken } from '../../lib/auth';

export default function JoinCoupleScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [coupleCode, setCoupleCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinCouple = async () => {
    console.log('🚀 Starting join couple process...');
    
    // Validate inputs
    const { validateName, validateCoupleCode } = require('../../lib/validation');
    
    const nameValidation = validateName(name);
    if (!nameValidation.isValid) {
      console.log('❌ Name validation failed:', nameValidation.error);
      Alert.alert('Error', nameValidation.error);
      return;
    }

    const codeValidation = validateCoupleCode(coupleCode);
    if (!codeValidation.isValid) {
      console.log('❌ Couple code validation failed:', codeValidation.error);
      Alert.alert('Error', codeValidation.error);
      return;
    }

    const code = codeValidation.sanitized;
    console.log('🔍 Validated couple code:', code);

    console.log('✅ Couple code format is valid');
    setIsJoining(true);

    try {
      console.log('🔍 Checking if couple can accept new member...');
      
      // First, check if this is an existing user trying to rejoin
      const storedAuthToken = await getStoredAuthToken();
      let isRejoining = false;
      
      if (storedAuthToken) {
        console.log('🔍 Checking if user can rejoin existing couple...');
        isRejoining = await canRejoinCouple(code, storedAuthToken);
        console.log('📊 Can rejoin couple result:', isRejoining);
      }
      
      if (!isRejoining) {
        // Check if couple can accept new member
        const canJoin = await canJoinCouple(code);
        console.log('📊 Can join couple result:', canJoin);
        
        if (!canJoin) {
          console.log('❌ Cannot join couple - invalid code or already full');
          Alert.alert('Error', 'Invalid couple code or couple is already full');
          return;
        }
      } else {
        console.log('✅ User can rejoin existing couple');
      }

      // Get couple info
      console.log('🔍 Fetching couple info for code:', code);
      const { data: couples, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .eq('couple_code', code);

      if (coupleError) {
        console.error('❌ Error fetching couple:', coupleError);
        Alert.alert('Error', 'Database error: ' + coupleError.message);
        return;
      }

      if (!couples || couples.length === 0) {
        console.log('❌ No couple found with code:', code);
        Alert.alert('Error', 'Invalid couple code');
        return;
      }

      const couple = couples[0];
      console.log('✅ Found couple:', couple.id);

      let user;
      let authToken;

      if (isRejoining) {
        // User is rejoining - get existing user data
        console.log('🔄 User is rejoining existing couple...');
        const { data: existingUsers, error: existingUserError } = await supabase
          .from('users')
          .select('*')
          .eq('couple_id', couple.id)
          .eq('auth_token', storedAuthToken);

        if (existingUserError || !existingUsers || existingUsers.length === 0) {
          console.error('❌ Error fetching existing user:', existingUserError);
          throw new Error('Failed to find existing user');
        }

        user = existingUsers[0];
        authToken = storedAuthToken;
        console.log('✅ Found existing user:', user.id);
      } else {
        // New user - generate auth token and create user record
        console.log('🔑 Generating auth token...');
        authToken = generateAuthToken();
        console.log('✅ Auth token generated');

        console.log('👤 Creating user record...');
        const { data: users, error: userError } = await supabase
          .from('users')
          .insert({
            name: nameValidation.sanitized,
            auth_token: authToken,
            couple_id: couple.id,
            is_paired: false,
          })
          .select();

        if (userError) {
          console.error('❌ Error creating user:', userError);
          throw userError;
        }

        if (!users || users.length === 0) {
          console.error('❌ No user data returned after creation');
          throw new Error('Failed to create user');
        }

        user = users[0];
        console.log('✅ User created:', user.id);
      }

      // Get the existing partner (look for any user in the couple who is not the current user)
      console.log('🔍 Looking for existing partner in couple:', couple.id);
      const { data: partners, error: partnerError } = await supabase
        .from('users')
        .select('id, name, is_paired')
        .eq('couple_id', couple.id)
        .neq('id', user.id);

      if (partnerError) {
        console.error('❌ Error fetching partner:', partnerError);
        Alert.alert('Error', 'Database error: ' + partnerError.message);
        return;
      }

      if (!partners || partners.length === 0) {
        console.log('❌ No partner found in couple');
        Alert.alert('Error', 'Could not find partner');
        return;
      }

      const partner = partners[0];
      console.log('✅ Found partner:', partner.name, partner.id, 'is_paired:', partner.is_paired);

      // Update both users to be paired
      console.log('🔗 Updating user to be paired with partner...');
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          is_paired: true,
          partner_id: partner.id,
        })
        .eq('id', user.id);

      if (updateUserError) {
        console.error('❌ Error updating user:', updateUserError);
        throw updateUserError;
      }
      console.log('✅ User updated to be paired');

      console.log('🔗 Updating partner to be paired with user...');
      const { error: updatePartnerError } = await supabase
        .from('users')
        .update({
          is_paired: true,
          partner_id: user.id,
        })
        .eq('id', partner.id);

      if (updatePartnerError) {
        console.error('❌ Error updating partner:', updatePartnerError);
        throw updatePartnerError;
      }
      console.log('✅ Partner updated to be paired');
      console.log('🎉 Join couple process completed successfully!');

      // Store auth token and navigate to app immediately
      console.log('🚀 Storing auth token and navigating...');
      const { storeAuthToken } = require('../../lib/auth');
      
      try {
        await storeAuthToken(authToken);
        console.log('✅ Auth token stored successfully');
        console.log('🔄 Redirecting to main app...');
        
        // Directly reload to show main app
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (error) {
        console.error('❌ Error storing auth token:', error);
        Alert.alert('Error', 'Failed to store authentication. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error joining couple:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      Alert.alert('Error', 'Failed to join couple: ' + (error.message || 'Unknown error'));
    } finally {
      console.log('🏁 Join couple process finished');
      setIsJoining(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Join Your Partner</Text>
            <Text style={styles.subtitle}>
              Enter the code your partner shared with you
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

            <Text style={styles.label}>Couple Code *</Text>
            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={coupleCode}
                onChangeText={(text) => setCoupleCode(text.toUpperCase())}
                placeholder="ABC123"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={6}
              />
              <TouchableOpacity
                style={styles.pasteButton}
                onPress={async () => {
                  try {
                    const clipboardContent = await Clipboard.getString();
                    if (clipboardContent && clipboardContent.length === 6) {
                      setCoupleCode(clipboardContent.toUpperCase());
                    } else {
                      Alert.alert('No Code', 'No valid 6-character code found in clipboard');
                    }
                  } catch (error) {
                    Alert.alert('Error', 'Failed to read clipboard');
                  }
                }}
              >
                <Text style={styles.pasteButtonText}>Paste</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.joinButton, isJoining && styles.joinButtonDisabled]}
              onPress={handleJoinCouple}
              disabled={isJoining}
            >
              <Text style={styles.joinButtonText}>
                {isJoining ? 'Joining...' : 'Join Couple'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoTitle}>Need the code?</Text>
            <Text style={styles.infoText}>
              Ask your partner to share their 6-character couple code with you. 
              It should look something like "ABC123".
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
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  codeInputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  codeInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  pasteButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pasteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  joinButton: {
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
  joinButtonDisabled: {
    backgroundColor: '#ccc',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    backgroundColor: '#f0f8ff',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
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
});

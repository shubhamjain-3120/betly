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
import { canJoinCouple, isValidCoupleCode } from '../../lib/coupleCode';
import { generateAuthToken } from '../../lib/auth';

export default function JoinCoupleScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [coupleCode, setCoupleCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinCouple = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!coupleCode.trim()) {
      Alert.alert('Error', 'Please enter the couple code');
      return;
    }

    if (!isValidCoupleCode(coupleCode.trim().toUpperCase())) {
      Alert.alert('Error', 'Please enter a valid 6-character code');
      return;
    }

    setIsJoining(true);

    try {
      const code = coupleCode.trim().toUpperCase();
      
      // Check if couple can accept new member
      const canJoin = await canJoinCouple(code);
      if (!canJoin) {
        Alert.alert('Error', 'Invalid couple code or couple is already full');
        return;
      }

      // Get couple info
      const { data: couples, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .eq('couple_code', code);

      if (coupleError || !couples || couples.length === 0) {
        Alert.alert('Error', 'Invalid couple code');
        return;
      }

      const couple = couples[0];

      // Generate auth token
      const authToken = generateAuthToken();

      // Create user record
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
        throw userError || new Error('Failed to create user');
      }

      const user = users[0];

      // Get the existing partner
      const { data: partners, error: partnerError } = await supabase
        .from('users')
        .select('id, name')
        .eq('couple_id', couple.id)
        .neq('id', user.id);

      if (partnerError || !partners || partners.length === 0) {
        Alert.alert('Error', 'Could not find partner');
        return;
      }

      const partner = partners[0];

      // Update both users to be paired
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          is_paired: true,
          partner_id: partner.id,
        })
        .eq('id', user.id);

      if (updateUserError) throw updateUserError;

      const { error: updatePartnerError } = await supabase
        .from('users')
        .update({
          is_paired: true,
          partner_id: user.id,
        })
        .eq('id', partner.id);

      if (updatePartnerError) throw updatePartnerError;

      Alert.alert(
        'Welcome to the couple! 🎉',
        `You've successfully joined ${partner.name}'s couple!\n\nYou can now start betting together.`,
        [
          {
            text: 'Start Betting',
            onPress: () => {
              // Store auth token and navigate to app
              const { storeAuthToken } = require('../../lib/auth');
              storeAuthToken(authToken).then(() => {
                // Force a page reload to trigger auth state change
                setTimeout(() => {
                  window.location.reload();
                }, 500);
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error joining couple:', error);
      Alert.alert('Error', 'Failed to join couple');
    } finally {
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

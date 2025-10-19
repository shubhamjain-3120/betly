import React, { useState, useEffect } from 'react';
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
import { getCurrentUser, logout } from '../../lib/auth';

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      setCurrentUser(user);
      setName(user.name);

      // Load partner name if paired
      if (user.is_paired && user.partner_id) {
        const { data: partners, error } = await supabase
          .from('users')
          .select('name')
          .eq('id', user.partner_id);

        if (!error && partners && partners.length > 0) {
          setPartnerName(partners[0].name);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Please log in again');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', currentUser.id);

      if (error) throw error;

      Alert.alert('Success', 'Name updated successfully!');
      // Reload user data
      await loadCurrentUser();
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnlinkPartner = () => {
    Alert.alert(
      'Unlink Partner',
      'Are you sure you want to unlink from your partner? This will allow you to join a different couple, but your betting history will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: unlinkPartner,
        },
      ]
    );
  };

  const unlinkPartner = async () => {
    if (!currentUser || !currentUser.partner_id) {
      Alert.alert('Error', 'No partner to unlink');
      return;
    }

    try {
      // Update both users to unlink them
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          is_paired: false,
          partner_id: null,
        })
        .eq('id', currentUser.id);

      if (updateUserError) throw updateUserError;

      const { error: updatePartnerError } = await supabase
        .from('users')
        .update({
          is_paired: false,
          partner_id: null,
        })
        .eq('id', currentUser.partner_id);

      if (updatePartnerError) throw updatePartnerError;

      Alert.alert(
        'Partner Unlinked',
        'You have been unlinked from your partner. You can now join a different couple or create a new one.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Logout and return to onboarding
              logout().then(() => {
                // The app will automatically redirect to onboarding
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error unlinking partner:', error);
      Alert.alert('Error', 'Failed to unlink partner');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // The app will automatically redirect to onboarding
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadCurrentUser();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={saveName}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Name'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Partner Section */}
          {currentUser?.is_paired && partnerName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Partner</Text>
              <View style={styles.partnerCard}>
                <Text style={styles.partnerName}>{partnerName}</Text>
                <Text style={styles.partnerStatus}>Connected</Text>
                <TouchableOpacity
                  style={styles.unlinkButton}
                  onPress={handleUnlinkPartner}
                >
                  <Text style={styles.unlinkButtonText}>Unlink Partner</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About Bet Together</Text>
            <Text style={styles.infoText}>
              A fun way for couples to bet on anything and track who's winning! 
              Create bets, see your stats, and enjoy some friendly competition.
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
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  partnerCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  partnerStatus: {
    fontSize: 14,
    color: '#34C759',
    marginBottom: 15,
  },
  unlinkButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  unlinkButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
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
});

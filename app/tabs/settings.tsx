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

export default function SettingsScreen() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadCurrentName = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (error) throw error;
      setName(data?.name || 'You');
    } catch (error) {
      console.error('Error loading name:', error);
      setName('You');
    }
  };

  const saveName = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ name: name.trim() })
        .eq('id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;

      Alert.alert('Success', 'Name updated successfully!');
    } catch (error) {
      console.error('Error saving name:', error);
      Alert.alert('Error', 'Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
    Alert.alert(
      'Reset Name',
      'Are you sure you want to reset your name to "You"?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setName('You');
            saveName();
          },
        },
      ]
    );
  };

  useEffect(() => {
    loadCurrentName();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                maxLength={50}
              />
              <Text style={styles.helpText}>
                This name will appear in bets and leaderboard
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={saveName}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Name'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetToDefault}
            >
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Info</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Bet Platform</Text>
              <Text style={styles.infoText}>Version 1.0.0</Text>
              <Text style={styles.infoText}>Built with React Native & Supabase</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Database Status</Text>
            
            <TouchableOpacity
              style={styles.testButton}
              onPress={async () => {
                try {
                  const { data, error } = await supabase
                    .from('users')
                    .select('count')
                    .limit(1);
                  
                  if (error) throw error;
                  
                  Alert.alert('Success', 'Database connection is working!');
                } catch (error) {
                  Alert.alert('Error', 'Database connection failed');
                }
              }}
            >
              <Text style={styles.testButtonText}>Test Database Connection</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
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
    marginBottom: 20,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  testButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

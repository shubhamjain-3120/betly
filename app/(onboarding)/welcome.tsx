import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>💕</Text>
          <Text style={styles.appName}>Bet Together</Text>
          <Text style={styles.tagline}>Make betting fun with your partner</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionText}>
            Create bets with your partner, track your wins, and see who's the ultimate betting champion!
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('CreateCouple' as never)}
          >
            <Text style={styles.primaryButtonText}>Create Couple Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('JoinCouple' as never)}
          >
            <Text style={styles.secondaryButtonText}>Join Existing Couple</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Perfect for couples who love a little friendly competition! 🎯
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  description: {
    marginBottom: 50,
  },
  descriptionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Import screens
import ActiveBetsScreen from './app/tabs/index';
import CreateScreen from './app/tabs/create';
import HistoryScreen from './app/tabs/history';
import SettingsScreen from './app/tabs/settings';

// Import onboarding screens
import WelcomeScreen from './app/(onboarding)/welcome';
import CreateCoupleScreen from './app/(onboarding)/create-couple';
import JoinCoupleScreen from './app/(onboarding)/join-couple';

// Import auth
import { isAuthenticated } from './lib/auth';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main app tabs (authenticated users)
function MainApp({ onLogout }: { onLogout: () => void }) {
  console.log('🏠 MainApp rendered with onLogout:', !!onLogout);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={ActiveBetsScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateScreen}
        options={{ title: 'New Bet' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="Settings" 
        options={{ title: 'Settings' }}
      >
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Onboarding stack (unauthenticated users)
function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="CreateCouple" component={CreateCoupleScreen} />
      <Stack.Screen name="JoinCouple" component={JoinCoupleScreen} />
    </Stack.Navigator>
  );
}

// Loading screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCheckTrigger, setAuthCheckTrigger] = useState(0);

  useEffect(() => {
    checkAuthStatus();
  }, [authCheckTrigger]);

  const checkAuthStatus = async () => {
    try {
      console.log('🔐 Checking authentication status...');
      const { isAuthenticated: authStatus } = await import('./lib/auth');
      const authenticated = await authStatus();
      console.log('🔐 Authentication status:', authenticated);
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to trigger auth check (for logout)
  const triggerAuthCheck = () => {
    console.log('🔄 Triggering auth check...');
    console.log('🔄 Current auth state:', isAuthenticated);
    setAuthCheckTrigger(prev => {
      console.log('🔄 Auth check trigger updated:', prev + 1);
      return prev + 1;
    });
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isAuthenticated ? <MainApp onLogout={triggerAuthCheck} /> : <OnboardingStack />}
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

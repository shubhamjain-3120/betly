import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import screens
import ActiveBetsScreen from './app/tabs/index';
import PendingScreen from './app/tabs/pending';
import CreateScreen from './app/tabs/create';
import HistoryScreen from './app/tabs/history';
import LeaderboardScreen from './app/tabs/leaderboard';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
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
            name="Active" 
            component={ActiveBetsScreen}
            options={{ title: 'Active Bets' }}
          />
          <Tab.Screen 
            name="Pending" 
            component={PendingScreen}
            options={{ title: 'Pending' }}
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
            name="Leaderboard" 
            component={LeaderboardScreen}
            options={{ title: 'Leaderboard' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NewLoadScreen from '../screens/NewLoadScreen';
import CheckInScreen from '../screens/CheckInScreen';
import DetentionScreen from '../screens/DetentionScreen';
import HistoryScreen from '../screens/HistoryScreen';
import LoadDetailScreen from '../screens/LoadDetailScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <SignedIn>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0a3d62' }, headerTintColor: '#fff' }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'HaulClock' }} />
          <Stack.Screen name="NewLoad" component={NewLoadScreen} options={{ title: 'New Load' }} />
          <Stack.Screen name="CheckIn" component={CheckInScreen} options={{ title: 'Check In' }} />
          <Stack.Screen name="Detention" component={DetentionScreen} options={{ title: 'Detention' }} />
          <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Load History' }} />
          <Stack.Screen name="LoadDetail" component={LoadDetailScreen} options={{ title: 'Load' }} />
        </Stack.Navigator>
      </SignedIn>
      <SignedOut>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </SignedOut>
    </NavigationContainer>
  );
}

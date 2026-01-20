import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CheckInScreen from '@/screens/CheckInScreen';
import PatternsScreen from '@/screens/PatternsScreen';
import { useTheme } from '@/hooks/useTheme';
import { useScreenOptions } from '@/hooks/useScreenOptions';

export type CheckInStackParamList = {
  CheckIn: undefined;
  Patterns: undefined;
};

const Stack = createNativeStackNavigator<CheckInStackParamList>();

export default function CheckInStackNavigator() {
  const { theme } = useTheme();
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          headerTitle: 'Check-in',
        }}
      />
      <Stack.Screen
        name="Patterns"
        component={PatternsScreen}
        options={{
          headerTitle: 'Your Patterns',
        }}
      />
    </Stack.Navigator>
  );
}

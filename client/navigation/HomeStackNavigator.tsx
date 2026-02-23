import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CycleScreen } from "@/screens/CycleScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HomeStackParamList = {
  Home: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={CycleScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

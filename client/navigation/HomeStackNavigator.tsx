import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LotusCycleScreen from "@/screens/LotusCycleScreen";
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
        component={LotusCycleScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

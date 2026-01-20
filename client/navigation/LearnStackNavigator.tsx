import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LearnScreen from "@/screens/LearnScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type LearnStackParamList = {
  Learn: undefined;
};

const Stack = createNativeStackNavigator<LearnStackParamList>();

export default function LearnStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Learn"
        component={LearnScreen}
        options={{
          headerTitle: "Education",
        }}
      />
    </Stack.Navigator>
  );
}

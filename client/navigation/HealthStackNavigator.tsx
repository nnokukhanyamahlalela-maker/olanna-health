import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HealthScreen from "@/screens/HealthScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type HealthStackParamList = {
  Health: undefined;
};

const Stack = createNativeStackNavigator<HealthStackParamList>();

export default function HealthStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Health"
        component={HealthScreen}
        options={{
          headerTitle: "Health Center",
        }}
      />
    </Stack.Navigator>
  );
}

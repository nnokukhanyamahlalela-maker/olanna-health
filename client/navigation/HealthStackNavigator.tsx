import React from "react";
import { Platform } from "react-native";
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
          headerTitle: "Health",
          ...(Platform.OS === "ios" && {
            headerLargeTitle: true,
            headerLargeStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
          }),
        }}
      />
    </Stack.Navigator>
  );
}

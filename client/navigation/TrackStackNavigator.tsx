import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TrackScreen from "@/screens/TrackScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type TrackStackParamList = {
  Track: undefined;
};

const Stack = createNativeStackNavigator<TrackStackParamList>();

export default function TrackStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Track"
        component={TrackScreen}
        options={{
          headerTitle: "Daily Log",
        }}
      />
    </Stack.Navigator>
  );
}

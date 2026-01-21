import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

import MainTabNavigator, { MainTabParamList } from "@/navigation/MainTabNavigator";
import OnboardingScreen from "@/screens/OnboardingScreen";
import AIChatScreen from "@/screens/AIChatScreen";
import PCOSModuleScreen from "@/screens/PCOSModuleScreen";
import EndometriosisModuleScreen from "@/screens/EndometriosisModuleScreen";
import SexualHealthModuleScreen from "@/screens/SexualHealthModuleScreen";
import CervicalScreeningModuleScreen from "@/screens/CervicalScreeningModuleScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import PrivacySettingsScreen from "@/screens/PrivacySettingsScreen";
import FertilityTrackingScreen from "@/screens/FertilityTrackingScreen";
import InsightsScreen from "@/screens/InsightsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: undefined;
  AIChat: undefined;
  PCOSModule: undefined;
  EndometriosisModule: undefined;
  SexualHealthModule: undefined;
  CervicalScreeningModule: undefined;
  EditProfile: undefined;
  PrivacySettings: undefined;
  FertilityTracking: undefined;
  Insights: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          headerTitle: "Health Assistant",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="PCOSModule"
        component={PCOSModuleScreen}
        options={{
          headerTitle: "PCOS Management",
        }}
      />
      <Stack.Screen
        name="EndometriosisModule"
        component={EndometriosisModuleScreen}
        options={{
          headerTitle: "Endometriosis Care",
        }}
      />
      <Stack.Screen
        name="SexualHealthModule"
        component={SexualHealthModuleScreen}
        options={{
          headerTitle: "Sexual Health",
        }}
      />
      <Stack.Screen
        name="CervicalScreeningModule"
        component={CervicalScreeningModuleScreen}
        options={{
          headerTitle: "Cervical Screening",
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerTitle: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{
          headerTitle: "Privacy & Data",
        }}
      />
      <Stack.Screen
        name="FertilityTracking"
        component={FertilityTrackingScreen}
        options={{
          headerTitle: "Fertility Tracking",
        }}
      />
      <Stack.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          headerTitle: "Your Insights",
        }}
      />
    </Stack.Navigator>
  );
}

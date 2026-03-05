import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigatorScreenParams } from "@react-navigation/native";

import MainTabNavigator, { MainTabParamList } from "@/navigation/MainTabNavigator";
import IntroLogo from "@/screens/IntroLogo";
import SplashScreen from "@/screens/SplashScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import PCOSModuleScreen from "@/screens/PCOSModuleScreen";
import EndometriosisModuleScreen from "@/screens/EndometriosisModuleScreen";
import SexualHealthModuleScreen from "@/screens/SexualHealthModuleScreen";
import CervicalScreeningModuleScreen from "@/screens/CervicalScreeningModuleScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import PrivacySettingsScreen from "@/screens/PrivacySettingsScreen";
import PrivacyStatementScreen from "@/screens/PrivacyStatementScreen";
import FertilityTrackingScreen from "@/screens/FertilityTrackingScreen";
import InsightsScreen from "@/screens/InsightsScreen";
import CheckInScreen from "@/screens/CheckInScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import CycleCalculatorScreen from "@/screens/CycleCalculatorScreen";
import DailyDecodeScreen from "@/screens/DailyDecodeScreen";
import AppearanceScreen from "@/screens/AppearanceScreen";
import TermsOfServiceScreen from "@/screens/TermsOfServiceScreen";
import AboutScreen from "@/screens/AboutScreen";

import CheckInSheet from "@/screens/CheckInSheet";
import ProductSafetyScreen from "@/screens/ProductSafetyScreen";
import LogProductScreen from "@/screens/LogProductScreen";
import ProductInsightsScreen from "@/screens/ProductInsightsScreen";
import LearnMoreSheet from "@/screens/LearnMoreSheet";
import PartnerSettingsScreen from "@/screens/PartnerSettingsScreen";
import PartnerPreviewScreen from "@/screens/PartnerPreviewScreen";
import PartnerDashboardScreen from "@/screens/PartnerDashboardScreen";
import PMSCheckerScreen from "@/screens/PMSCheckerScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { DailyDecodeOutput } from "@/lib/dailyDecode";

export type RootStackParamList = {
  IntroLogo: undefined;
  Splash: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: undefined;
  PCOSModule: undefined;
  EndometriosisModule: undefined;
  SexualHealthModule: undefined;
  CervicalScreeningModule: undefined;
  EditProfile: undefined;
  PrivacySettings: undefined;
  PrivacyStatement: undefined;
  FertilityTracking: undefined;
  Insights: undefined;
  CheckIn: undefined;
  Profile: undefined;
  CycleCalculator: undefined;
  DailyDecode: { decode: DailyDecodeOutput };
  Appearance: undefined;
  TermsOfService: undefined;
  About: undefined;

  CheckInSheet: undefined;
  ProductSafety: undefined;
  LogProduct: undefined;
  ProductInsights: undefined;
  LearnMoreSheet: undefined;
  PartnerSettings: undefined;
  PartnerPreview: undefined;
  PartnerDashboard: undefined;
  PMSChecker: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions} initialRouteName="IntroLogo">
      <Stack.Screen
        name="IntroLogo"
        component={IntroLogo}
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false, animation: "fade" }}
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
        name="PrivacyStatement"
        component={PrivacyStatementScreen}
        options={{
          headerTitle: "Privacy Statement",
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
      <Stack.Screen
        name="CheckIn"
        component={CheckInScreen}
        options={{
          headerTitle: "Check-in",
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: "Profile",
        }}
      />
      <Stack.Screen
        name="CycleCalculator"
        component={CycleCalculatorScreen}
        options={{
          headerTitle: "Cycle Calculator",
        }}
      />
      <Stack.Screen
        name="DailyDecode"
        component={DailyDecodeScreen}
        options={{
          headerTitle: "Your Daily Decode",
        }}
      />
      <Stack.Screen
        name="Appearance"
        component={AppearanceScreen}
        options={{
          headerTitle: "Appearance",
        }}
      />
      <Stack.Screen
        name="ProductSafety"
        component={ProductSafetyScreen}
        options={{
          headerTitle: "Product Safety",
        }}
      />
      <Stack.Screen
        name="LogProduct"
        component={LogProductScreen}
        options={{
          headerTitle: "Log a Product",
        }}
      />
      <Stack.Screen
        name="ProductInsights"
        component={ProductInsightsScreen}
        options={{
          headerTitle: "My Product Insights",
        }}
      />
      <Stack.Screen
        name="PartnerSettings"
        component={PartnerSettingsScreen}
        options={{
          headerTitle: "Partner Mode",
        }}
      />
      <Stack.Screen
        name="PartnerPreview"
        component={PartnerPreviewScreen}
        options={{
          headerTitle: "Partner Preview",
        }}
      />
      <Stack.Screen
        name="PartnerDashboard"
        component={PartnerDashboardScreen}
        options={{
          headerTitle: "Partner Dashboard",
        }}
      />
      <Stack.Screen
        name="PMSChecker"
        component={PMSCheckerScreen}
        options={{
          headerTitle: "PMS Symptom Checker",
        }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{
          headerTitle: "Terms of Service",
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          headerTitle: "About",
        }}
      />
      <Stack.Screen
        name="LearnMoreSheet"
        component={LearnMoreSheet}
        options={{
          headerShown: false,
          presentation: "formSheet",
          gestureEnabled: true,
          sheetGrabberVisible: true,
          sheetCornerRadius: 20,
        }}
      />
      <Stack.Screen
        name="CheckInSheet"
        component={CheckInSheet}
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
          gestureEnabled: true,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack.Navigator>
  );
}

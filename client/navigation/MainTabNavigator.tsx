import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import CheckInStackNavigator from "@/navigation/CheckInStackNavigator";
import CalendarStackNavigator from "@/navigation/CalendarStackNavigator";
import HealthStackNavigator from "@/navigation/HealthStackNavigator";
import LearnStackNavigator from "@/navigation/LearnStackNavigator";
import { CustomTabBar } from "@/components/CustomTabBar";

export type MainTabParamList = {
  HomeTab: undefined;
  CalendarTab: undefined;
  CheckInTab: undefined;
  HealthTab: undefined;
  LearnTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: "Cycle" }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={CalendarStackNavigator}
        options={{ title: "Calendar" }}
      />
      <Tab.Screen
        name="CheckInTab"
        component={CheckInStackNavigator}
        options={{ title: "Check-in" }}
      />
      <Tab.Screen
        name="HealthTab"
        component={HealthStackNavigator}
        options={{ title: "Health" }}
      />
      <Tab.Screen
        name="LearnTab"
        component={LearnStackNavigator}
        options={{ title: "Learn" }}
      />
    </Tab.Navigator>
  );
}

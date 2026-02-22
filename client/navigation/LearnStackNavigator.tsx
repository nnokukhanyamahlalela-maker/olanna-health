import React from "react";
import { Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LearnScreen from "@/screens/LearnScreen";
import ArticleDetailScreen from "@/screens/ArticleDetailScreen";
import GlossaryScreen from "@/screens/GlossaryScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type LearnStackParamList = {
  Learn: undefined;
  ArticleDetail: { articleId: string };
  Glossary: undefined;
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
          headerTitle: "Learn",
          ...(Platform.OS === "ios" && {
            headerLargeTitle: true,
            headerLargeStyle: { backgroundColor: "transparent" },
            headerTransparent: true,
          }),
        }}
      />
      <Stack.Screen
        name="ArticleDetail"
        component={ArticleDetailScreen}
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Glossary"
        component={GlossaryScreen}
        options={{
          headerTitle: "Glossary",
        }}
      />
    </Stack.Navigator>
  );
}

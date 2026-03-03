import React, { useEffect, useRef } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView } from "expo-video";

import { RootStackParamList } from "@/navigation/RootStackNavigator";

const introVideoSource = require("@/assets/videos/olanna-intro.mp4");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const hasNavigated = useRef(false);

  const navigate = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    navigation.replace("Onboarding");
  };

  const player = useVideoPlayer(introVideoSource, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      navigate();
    });

    const fallback = setTimeout(() => {
      navigate();
    }, 30000);

    return () => {
      subscription.remove();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});

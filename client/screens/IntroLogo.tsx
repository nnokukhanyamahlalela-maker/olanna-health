import React, { useEffect, useRef } from "react";
import { StyleSheet, View, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView } from "expo-video";

import { RootStackParamList } from "@/navigation/RootStackNavigator";

const introVideoSource = require("@/assets/videos/olanna-intro.mp4");

const DISPLAY_DURATION_MS = 7000;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function IntroLogo() {
  const navigation = useNavigation<NavigationProp>();
  const hasNavigated = useRef(false);
  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = () => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;
    navigation.replace("Onboarding");
  };

  const player = useVideoPlayer(introVideoSource, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    const statusSub = player.addListener("statusChange", (newStatus) => {
      if (newStatus.status === "readyToPlay" && !playTimerRef.current) {
        player.play();
        playTimerRef.current = setTimeout(navigate, DISPLAY_DURATION_MS);
      }
    });

    if (player.status === "readyToPlay") {
      player.play();
      playTimerRef.current = setTimeout(navigate, DISPLAY_DURATION_MS);
    }

    const fallback = setTimeout(navigate, 15000);

    return () => {
      statusSub.remove();
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
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

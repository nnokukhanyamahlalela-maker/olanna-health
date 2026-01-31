import React, { useRef, useState, useEffect } from "react";
import { View, StyleSheet, FlatList, Dimensions, Pressable, AccessibilityInfo } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppGradient } from "@/components/AppGradient";
import { HeroText } from "@/components/HeroText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { DS } from "@/constants/designSystem";

const { width, height } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
  { id: "1", text: "Girl, hi!\n\nMy name is\nOlanna." },
  { id: "2", text: "What\nshall I\ncall you?" },
  { id: "3", text: "And to\nwhat do I\nowe this\npleasure?" },
];

export default function OnboardingSimple() {
  const navigation = useNavigation<NavigationProp>();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ 
        index: index + 1, 
        animated: !reduceMotion 
      });
    } else {
      navigation.replace("Main", { screen: "HomeTab" });
    }
  };

  return (
    <AppGradient>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={!reduceMotion}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width, height }]}>
            <HeroText style={styles.bigText}>{item.text}</HeroText>

            <Pressable 
              onPress={goNext} 
              style={styles.nextArea}
              accessibilityRole="button"
              accessibilityLabel={index === SLIDES.length - 1 ? "Continue to app" : "Go to next slide"}
              accessibilityHint="Double tap to advance"
            >
              <HeroText size="small" style={styles.nextText}>
                {index === SLIDES.length - 1 ? "Continue" : "Next"}
              </HeroText>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index ? styles.dotActive : styles.dotInactive,
            ]}
            accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}${i === index ? ", current" : ""}`}
          />
        ))}
      </View>
    </AppGradient>
  );
}

const styles = StyleSheet.create({
  slide: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  bigText: {
    textAlign: "center",
  },
  nextArea: {
    position: "absolute",
    bottom: 100,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: DS.radii.pill,
    backgroundColor: "rgba(255,255,255,0.22)",
    minWidth: DS.touchTarget.minWidth,
    minHeight: DS.touchTarget.minHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  nextText: {
    fontSize: 16,
    fontWeight: "700",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 60,
    flexDirection: "row",
    alignSelf: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#FFFFFF",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});

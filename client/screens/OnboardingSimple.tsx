import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, Dimensions, Pressable, AccessibilityInfo, NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppGradient } from "@/components/AppGradient";
import { HeroText } from "@/components/HeroText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { DS } from "@/constants/designSystem";

const { width, height } = Dimensions.get("window");

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SLIDES = [
  { id: "1", text: "Girl, hi!\n\nMy name is\nOlanna.", isLast: false },
  { id: "2", text: "What\nshall I\ncall you?", isLast: false },
  { id: "3", text: "And to\nwhat do I\nowe this\npleasure?", isLast: true },
];

export default function OnboardingSimple() {
  const navigation = useNavigation<NavigationProp>();
  const listRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < SLIDES.length) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  const goToNextSlide = useCallback((itemIndex: number) => {
    if (itemIndex < SLIDES.length - 1) {
      const nextIndex = itemIndex + 1;
      setCurrentIndex(nextIndex);
      listRef.current?.scrollToIndex({ 
        index: nextIndex, 
        animated: !reduceMotion 
      });
    } else {
      navigation.replace("Main", { screen: "HomeTab" });
    }
  }, [navigation, reduceMotion]);

  const renderSlide = useCallback(({ item, index: itemIndex }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={[styles.slide, { width, height }]}>
      <HeroText style={styles.bigText}>{item.text}</HeroText>

      <Pressable 
        onPress={() => goToNextSlide(itemIndex)} 
        style={styles.nextArea}
        accessibilityRole="button"
        accessibilityLabel={item.isLast ? "Continue to app" : "Go to next slide"}
        accessibilityHint="Double tap to advance"
        testID={`onboarding-next-${itemIndex}`}
      >
        <HeroText size="small" style={styles.nextText}>
          {item.isLast ? "Continue" : "Next"}
        </HeroText>
      </Pressable>
    </View>
  ), [goToNextSlide]);

  return (
    <AppGradient>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={renderSlide}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <View style={styles.dotsContainer}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
            accessibilityLabel={`Slide ${i + 1} of ${SLIDES.length}${i === currentIndex ? ", current" : ""}`}
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

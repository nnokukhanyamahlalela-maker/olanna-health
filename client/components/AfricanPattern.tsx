import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, Circle, Pattern, Rect, Defs, G } from "react-native-svg";

import { useTheme } from "@/hooks/useTheme";

interface AfricanPatternProps {
  style?: any;
  opacity?: number;
  variant?: "zigzag" | "dots" | "waves" | "triangles";
}

export function AfricanPattern({
  style,
  opacity = 0.1,
  variant = "zigzag",
}: AfricanPatternProps) {
  const { theme } = useTheme();

  const renderPattern = () => {
    switch (variant) {
      case "dots":
        return (
          <Pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <Circle cx="5" cy="5" r="2" fill={theme.primary} opacity={opacity} />
            <Circle cx="15" cy="15" r="2" fill={theme.secondary} opacity={opacity} />
          </Pattern>
        );
      case "waves":
        return (
          <Pattern id="pattern" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <Path
              d="M0 10 Q10 0 20 10 T40 10"
              stroke={theme.primary}
              strokeWidth="2"
              fill="none"
              opacity={opacity}
            />
          </Pattern>
        );
      case "triangles":
        return (
          <Pattern id="pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <Path
              d="M12 0 L24 24 L0 24 Z"
              fill={theme.accent}
              opacity={opacity}
            />
          </Pattern>
        );
      case "zigzag":
      default:
        return (
          <Pattern id="pattern" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
            <Path
              d="M0 7.5 L7.5 0 L15 7.5 L22.5 0 L30 7.5"
              stroke={theme.primary}
              strokeWidth="1.5"
              fill="none"
              opacity={opacity}
            />
            <Path
              d="M0 15 L7.5 7.5 L15 15 L22.5 7.5 L30 15"
              stroke={theme.secondary}
              strokeWidth="1.5"
              fill="none"
              opacity={opacity}
            />
          </Pattern>
        );
    }
  };

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          {renderPattern()}
        </Defs>
        <Rect width="100%" height="100%" fill="url(#pattern)" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
});

import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Rect } from "react-native-svg";

interface OlannaLogoProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

export function OlannaLogo({ size = "large", color = "#FFFFFF" }: OlannaLogoProps) {
  const sizeConfig = {
    small: { olannaSize: 28, healthSize: 10, healthSpacing: 6, oWidth: 24, oHeight: 32, holeWidth: 10, holeHeight: 16 },
    medium: { olannaSize: 40, healthSize: 14, healthSpacing: 10, oWidth: 34, oHeight: 46, holeWidth: 14, holeHeight: 22 },
    large: { olannaSize: 52, healthSize: 18, healthSpacing: 14, oWidth: 44, oHeight: 58, holeWidth: 18, holeHeight: 28 },
  };

  const config = sizeConfig[size];

  return (
    <View style={styles.container}>
      <View style={styles.olannaRow}>
        <PillO width={config.oWidth} height={config.oHeight} holeWidth={config.holeWidth} holeHeight={config.holeHeight} color={color} />
        <Text style={[styles.olannaText, { fontSize: config.olannaSize, color }]}>LANNA</Text>
      </View>
      <Text style={[styles.healthText, { fontSize: config.healthSize, letterSpacing: config.healthSpacing, color }]}>
        HEALTH
      </Text>
    </View>
  );
}

function PillO({ 
  width, 
  height, 
  holeWidth, 
  holeHeight, 
  color 
}: { 
  width: number; 
  height: number; 
  holeWidth: number; 
  holeHeight: number; 
  color: string;
}) {
  const borderRadius = width / 2;
  const holeBorderRadius = holeWidth / 2;
  const holeX = (width - holeWidth) / 2;
  const holeY = (height - holeHeight) / 2;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={borderRadius}
        ry={borderRadius}
        fill={color}
      />
      <Rect
        x={holeX}
        y={holeY}
        width={holeWidth}
        height={holeHeight}
        rx={holeBorderRadius}
        ry={holeBorderRadius}
        fill="transparent"
      />
    </Svg>
  );
}

export function AnimatedOlannaLogo({ 
  size = "large", 
  color = "#FFFFFF",
  style,
}: OlannaLogoProps & { style?: object }) {
  const sizeConfig = {
    small: { olannaSize: 28, healthSize: 10, healthSpacing: 6, oWidth: 24, oHeight: 32, holeWidth: 10, holeHeight: 16, gap: 0 },
    medium: { olannaSize: 40, healthSize: 14, healthSpacing: 10, oWidth: 34, oHeight: 46, holeWidth: 14, holeHeight: 22, gap: 0 },
    large: { olannaSize: 52, healthSize: 18, healthSpacing: 14, oWidth: 44, oHeight: 58, holeWidth: 18, holeHeight: 28, gap: -2 },
  };

  const config = sizeConfig[size];

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.olannaRow, { gap: config.gap }]}>
        <PillO width={config.oWidth} height={config.oHeight} holeWidth={config.holeWidth} holeHeight={config.holeHeight} color={color} />
        <Text style={[styles.olannaText, { fontSize: config.olannaSize, color }]}>LANNA</Text>
      </View>
      <Text style={[styles.healthText, { fontSize: config.healthSize, letterSpacing: config.healthSpacing, color }]}>
        HEALTH
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  olannaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  olannaText: {
    fontFamily: "Poppins_900Black",
    letterSpacing: -1,
    marginTop: 2,
  },
  healthText: {
    fontFamily: "Poppins_400Regular",
    marginTop: 4,
  },
});

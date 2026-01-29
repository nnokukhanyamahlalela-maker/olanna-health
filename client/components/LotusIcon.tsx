import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Path, G, Circle } from "react-native-svg";

type LotusVariant = "full" | "bud" | "mini";

interface LotusIconProps {
  size?: number;
  color?: string;
  variant?: LotusVariant;
  opacity?: number;
}

export function LotusIcon({
  size = 60,
  color = "#FFFFFF",
  variant = "full",
  opacity = 1,
}: LotusIconProps) {
  const cx = size / 2;
  const cy = size / 2;

  if (variant === "mini") {
    const petalSize = size * 0.35;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G opacity={opacity}>
          <Path
            d={`M ${cx} ${cy - petalSize}
               C ${cx - petalSize * 0.4} ${cy - petalSize * 0.5}
                 ${cx - petalSize * 0.4} ${cy + petalSize * 0.3}
                 ${cx} ${cy + petalSize * 0.5}
               C ${cx + petalSize * 0.4} ${cy + petalSize * 0.3}
                 ${cx + petalSize * 0.4} ${cy - petalSize * 0.5}
                 ${cx} ${cy - petalSize}
               Z`}
            fill={color}
          />
          <Circle cx={cx} cy={cy} r={size * 0.08} fill={color} opacity={0.6} />
        </G>
      </Svg>
    );
  }

  if (variant === "bud") {
    const petalH = size * 0.4;
    const petalW = size * 0.18;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G opacity={opacity}>
          <Path
            d={`M ${cx} ${cy - petalH}
               C ${cx - petalW} ${cy - petalH * 0.6}
                 ${cx - petalW} ${cy + petalH * 0.2}
                 ${cx} ${cy + petalH * 0.4}
               C ${cx + petalW} ${cy + petalH * 0.2}
                 ${cx + petalW} ${cy - petalH * 0.6}
                 ${cx} ${cy - petalH}
               Z`}
            fill={color}
          />
          <Path
            d={`M ${cx - petalW * 0.8} ${cy - petalH * 0.5}
               C ${cx - petalW * 1.6} ${cy - petalH * 0.2}
                 ${cx - petalW * 1.4} ${cy + petalH * 0.3}
                 ${cx - petalW * 0.3} ${cy + petalH * 0.35}
               C ${cx - petalW * 0.6} ${cy}
                 ${cx - petalW * 0.5} ${cy - petalH * 0.4}
                 ${cx - petalW * 0.8} ${cy - petalH * 0.5}
               Z`}
            fill={color}
            opacity={0.7}
          />
          <Path
            d={`M ${cx + petalW * 0.8} ${cy - petalH * 0.5}
               C ${cx + petalW * 1.6} ${cy - petalH * 0.2}
                 ${cx + petalW * 1.4} ${cy + petalH * 0.3}
                 ${cx + petalW * 0.3} ${cy + petalH * 0.35}
               C ${cx + petalW * 0.6} ${cy}
                 ${cx + petalW * 0.5} ${cy - petalH * 0.4}
                 ${cx + petalW * 0.8} ${cy - petalH * 0.5}
               Z`}
            fill={color}
            opacity={0.7}
          />
        </G>
      </Svg>
    );
  }

  const petalLength = size * 0.38;
  const petalWidth = size * 0.15;
  
  const createPetal = (angle: number, scale: number = 1, opacityMod: number = 1) => {
    const rad = (angle - 90) * (Math.PI / 180);
    const tipX = cx + Math.cos(rad) * petalLength * scale;
    const tipY = cy + Math.sin(rad) * petalLength * scale;
    
    const leftRad = rad - Math.PI / 2;
    const rightRad = rad + Math.PI / 2;
    
    const baseX1 = cx + Math.cos(leftRad) * petalWidth * 0.3;
    const baseY1 = cy + Math.sin(leftRad) * petalWidth * 0.3;
    const baseX2 = cx + Math.cos(rightRad) * petalWidth * 0.3;
    const baseY2 = cy + Math.sin(rightRad) * petalWidth * 0.3;
    
    const ctrlDist = petalLength * scale * 0.6;
    const ctrlSpread = petalWidth * scale * 0.7;
    
    const ctrl1X = cx + Math.cos(rad) * ctrlDist + Math.cos(leftRad) * ctrlSpread;
    const ctrl1Y = cy + Math.sin(rad) * ctrlDist + Math.sin(leftRad) * ctrlSpread;
    const ctrl2X = cx + Math.cos(rad) * ctrlDist + Math.cos(rightRad) * ctrlSpread;
    const ctrl2Y = cy + Math.sin(rad) * ctrlDist + Math.sin(rightRad) * ctrlSpread;
    
    return (
      <Path
        key={angle}
        d={`M ${baseX1} ${baseY1}
           Q ${ctrl1X} ${ctrl1Y} ${tipX} ${tipY}
           Q ${ctrl2X} ${ctrl2Y} ${baseX2} ${baseY2}
           Z`}
        fill={color}
        opacity={opacity * opacityMod}
      />
    );
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G>
        {createPetal(0, 1, 1)}
        {createPetal(72, 1, 1)}
        {createPetal(144, 1, 1)}
        {createPetal(216, 1, 1)}
        {createPetal(288, 1, 1)}
        <Circle cx={cx} cy={cy} r={size * 0.06} fill={color} opacity={opacity * 0.8} />
      </G>
    </Svg>
  );
}

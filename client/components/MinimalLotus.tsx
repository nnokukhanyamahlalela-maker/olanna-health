import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

interface MinimalLotusProps {
  size: number;
  color: string;
  opacity?: number;
}

export function MinimalLotus({ size, color, opacity = 1 }: MinimalLotusProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const petalLength = size * 0.38;
  const petalWidth = size * 0.22;

  const createRoundedPetal = (angle: number, length: number, width: number) => {
    const rad = (angle * Math.PI) / 180;
    const tipX = centerX + Math.cos(rad) * length;
    const tipY = centerY + Math.sin(rad) * length;
    
    const leftRad = ((angle - 90) * Math.PI) / 180;
    const rightRad = ((angle + 90) * Math.PI) / 180;
    
    const baseOffset = width * 0.25;
    const leftX = centerX + Math.cos(leftRad) * baseOffset;
    const leftY = centerY + Math.sin(leftRad) * baseOffset;
    const rightX = centerX + Math.cos(rightRad) * baseOffset;
    const rightY = centerY + Math.sin(rightRad) * baseOffset;
    
    const ctrl1X = centerX + Math.cos(rad) * (length * 0.55) + Math.cos(leftRad) * (width * 0.55);
    const ctrl1Y = centerY + Math.sin(rad) * (length * 0.55) + Math.sin(leftRad) * (width * 0.55);
    const ctrl2X = centerX + Math.cos(rad) * (length * 0.55) + Math.cos(rightRad) * (width * 0.55);
    const ctrl2Y = centerY + Math.sin(rad) * (length * 0.55) + Math.sin(rightRad) * (width * 0.55);
    
    const tipCtrl1X = tipX + Math.cos(leftRad) * (width * 0.15);
    const tipCtrl1Y = tipY + Math.sin(leftRad) * (width * 0.15);
    const tipCtrl2X = tipX + Math.cos(rightRad) * (width * 0.15);
    const tipCtrl2Y = tipY + Math.sin(rightRad) * (width * 0.15);

    return `M ${leftX} ${leftY} 
            Q ${ctrl1X} ${ctrl1Y} ${tipCtrl1X} ${tipCtrl1Y}
            Q ${tipX} ${tipY - (angle === -90 ? 5 : 0)} ${tipCtrl2X} ${tipCtrl2Y}
            Q ${ctrl2X} ${ctrl2Y} ${rightX} ${rightY} 
            Z`;
  };

  const petals = [
    { angle: -90, scale: 1 },
    { angle: -45, scale: 0.85 },
    { angle: -135, scale: 0.85 },
    { angle: 45, scale: 0.7 },
    { angle: 135, scale: 0.7 },
  ];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {petals.map((petal, index) => (
        <Path
          key={index}
          d={createRoundedPetal(petal.angle, petalLength * petal.scale, petalWidth * petal.scale)}
          fill={color}
          opacity={opacity * (index === 0 ? 1 : 0.7)}
        />
      ))}
      <Circle
        cx={centerX}
        cy={centerY}
        r={size * 0.08}
        fill={color}
        opacity={opacity * 0.9}
      />
    </Svg>
  );
}

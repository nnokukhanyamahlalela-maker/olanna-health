import React from "react";
import Svg, { Path, Circle, G } from "react-native-svg";

interface LotusProps {
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  size?: number;
  color?: string;
}

const DUSTY_ROSE = "#D4A99A";

function createPetalPath(
  cx: number,
  cy: number,
  angle: number,
  length: number,
  width: number,
  baseOffset: number = 0
): string {
  const rad = (angle * Math.PI) / 180;
  const perpRad = rad + Math.PI / 2;
  
  const baseY = cy + baseOffset;
  const tipX = cx + Math.cos(rad) * length;
  const tipY = baseY + Math.sin(rad) * length;
  
  const baseLeftX = cx + Math.cos(perpRad) * width * 0.3;
  const baseLeftY = baseY + Math.sin(perpRad) * width * 0.3;
  const baseRightX = cx - Math.cos(perpRad) * width * 0.3;
  const baseRightY = baseY - Math.sin(perpRad) * width * 0.3;
  
  const cp1X = cx + Math.cos(rad) * length * 0.5 + Math.cos(perpRad) * width * 0.6;
  const cp1Y = baseY + Math.sin(rad) * length * 0.5 + Math.sin(perpRad) * width * 0.6;
  const cp2X = cx + Math.cos(rad) * length * 0.5 - Math.cos(perpRad) * width * 0.6;
  const cp2Y = baseY + Math.sin(rad) * length * 0.5 - Math.sin(perpRad) * width * 0.6;
  
  return `M${baseLeftX} ${baseLeftY} Q${cp1X} ${cp1Y} ${tipX} ${tipY} Q${cp2X} ${cp2Y} ${baseRightX} ${baseRightY} Z`;
}

export function Lotus({ phase, size = 80, color = DUSTY_ROSE }: LotusProps) {
  const cx = size / 2;
  const cy = size / 2;

  const renderMenstrualLotus = () => {
    const petalLength = size * 0.32;
    const petalWidth = size * 0.14;
    const baseOffset = size * 0.06;
    
    return (
      <G>
        <Path
          d={createPetalPath(cx, cy, -90, petalLength, petalWidth, baseOffset)}
          fill={color}
          fillOpacity={0.95}
        />
        <Path
          d={createPetalPath(cx, cy, -70, petalLength * 0.85, petalWidth * 0.9, baseOffset)}
          fill={color}
          fillOpacity={0.7}
        />
        <Path
          d={createPetalPath(cx, cy, -110, petalLength * 0.85, petalWidth * 0.9, baseOffset)}
          fill={color}
          fillOpacity={0.7}
        />
        <Circle cx={cx} cy={cy + baseOffset} r={size * 0.05} fill={color} fillOpacity={0.9} />
      </G>
    );
  };

  const renderFollicularLotus = () => {
    const petalLength = size * 0.34;
    const petalWidth = size * 0.13;
    const baseOffset = size * 0.05;
    const angles = [-90, -55, -125, -25, -155];
    const opacities = [0.95, 0.8, 0.8, 0.55, 0.55];
    const scales = [1, 0.9, 0.9, 0.75, 0.75];
    
    return (
      <G>
        {angles.map((angle, i) => (
          <Path
            key={i}
            d={createPetalPath(cx, cy, angle, petalLength * scales[i], petalWidth * scales[i], baseOffset)}
            fill={color}
            fillOpacity={opacities[i]}
          />
        ))}
        <Circle cx={cx} cy={cy + baseOffset} r={size * 0.055} fill={color} fillOpacity={0.9} />
      </G>
    );
  };

  const renderOvulationLotus = () => {
    const petalLength = size * 0.38;
    const petalWidth = size * 0.12;
    const baseOffset = size * 0.04;
    const angles = [-90, -54, -126, -18, -162, 10, -190];
    const opacities = [1, 0.88, 0.88, 0.72, 0.72, 0.5, 0.5];
    const scales = [1, 0.95, 0.95, 0.88, 0.88, 0.7, 0.7];
    
    return (
      <G>
        {angles.map((angle, i) => (
          <Path
            key={i}
            d={createPetalPath(cx, cy, angle, petalLength * scales[i], petalWidth * scales[i], baseOffset)}
            fill={color}
            fillOpacity={opacities[i]}
          />
        ))}
        <Circle cx={cx} cy={cy + baseOffset} r={size * 0.06} fill={color} fillOpacity={0.95} />
      </G>
    );
  };

  const renderLutealLotus = () => {
    const petalLength = size * 0.35;
    const petalWidth = size * 0.13;
    const baseOffset = size * 0.05;
    const angles = [-90, -60, -120, -35, -145];
    const opacities = [0.9, 0.75, 0.75, 0.55, 0.55];
    const scales = [1, 0.92, 0.92, 0.8, 0.8];
    
    return (
      <G>
        {angles.map((angle, i) => (
          <Path
            key={i}
            d={createPetalPath(cx, cy, angle, petalLength * scales[i], petalWidth * scales[i], baseOffset)}
            fill={color}
            fillOpacity={opacities[i]}
          />
        ))}
        <Circle cx={cx} cy={cy + baseOffset} r={size * 0.055} fill={color} fillOpacity={0.9} />
      </G>
    );
  };

  const renderLotus = () => {
    switch (phase) {
      case "menstrual":
        return renderMenstrualLotus();
      case "follicular":
        return renderFollicularLotus();
      case "ovulation":
        return renderOvulationLotus();
      case "luteal":
        return renderLutealLotus();
    }
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {renderLotus()}
    </Svg>
  );
}

export function LotusIcon({ phase, size = 20, color = DUSTY_ROSE }: LotusProps) {
  return <Lotus phase={phase} size={size} color={color} />;
}

import React from "react";
import Svg, { Path, Circle, G } from "react-native-svg";

interface LotusProps {
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  size?: number;
  color?: string;
}

const BRAND_PINK = "#F6A9D2";

export function Lotus({ phase, size = 80, color = BRAND_PINK }: LotusProps) {
  const cx = size / 2;
  const cy = size / 2;

  const renderMenstrualLotus = () => {
    const petalWidth = size * 0.12;
    const petalHeight = size * 0.28;
    return (
      <G>
        <Path
          d={`M${cx} ${cy - petalHeight * 0.8} 
              Q${cx - petalWidth} ${cy - petalHeight * 0.4} ${cx} ${cy + petalHeight * 0.1}
              Q${cx + petalWidth} ${cy - petalHeight * 0.4} ${cx} ${cy - petalHeight * 0.8}`}
          fill={color}
          fillOpacity={0.9}
        />
        <Path
          d={`M${cx - petalWidth * 1.2} ${cy - petalHeight * 0.5} 
              Q${cx - petalWidth * 0.5} ${cy - petalHeight * 0.2} ${cx} ${cy + petalHeight * 0.1}
              Q${cx - petalWidth * 1.5} ${cy - petalHeight * 0.1} ${cx - petalWidth * 1.2} ${cy - petalHeight * 0.5}`}
          fill={color}
          fillOpacity={0.7}
        />
        <Path
          d={`M${cx + petalWidth * 1.2} ${cy - petalHeight * 0.5} 
              Q${cx + petalWidth * 0.5} ${cy - petalHeight * 0.2} ${cx} ${cy + petalHeight * 0.1}
              Q${cx + petalWidth * 1.5} ${cy - petalHeight * 0.1} ${cx + petalWidth * 1.2} ${cy - petalHeight * 0.5}`}
          fill={color}
          fillOpacity={0.7}
        />
        <Circle cx={cx} cy={cy} r={size * 0.06} fill={color} />
      </G>
    );
  };

  const renderFollicularLotus = () => {
    const r = size * 0.32;
    const angles = [-90, -45, -135, 0, 180];
    return (
      <G>
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const tipX = cx + Math.cos(rad) * r;
          const tipY = cy + Math.sin(rad) * r * 0.9;
          const opacity = i === 0 ? 0.95 : i < 3 ? 0.75 : 0.55;
          return (
            <Path
              key={angle}
              d={`M${cx} ${cy + size * 0.08} Q${cx + Math.cos(rad) * r * 0.3} ${cy + Math.sin(rad) * r * 0.5} ${tipX} ${tipY} 
                  Q${cx - Math.cos(rad) * r * 0.3} ${cy + Math.sin(rad) * r * 0.5} ${cx} ${cy + size * 0.08}`}
              fill={color}
              fillOpacity={opacity}
            />
          );
        })}
        <Circle cx={cx} cy={cy + size * 0.05} r={size * 0.07} fill={color} />
      </G>
    );
  };

  const renderOvulationLotus = () => {
    const r = size * 0.38;
    const angles = [-90, -60, -120, -30, -150, 0, 180];
    return (
      <G>
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const tipX = cx + Math.cos(rad) * r;
          const tipY = cy + Math.sin(rad) * r * 0.85;
          const opacity = i === 0 ? 1 : i < 3 ? 0.85 : i < 5 ? 0.65 : 0.45;
          return (
            <Path
              key={angle}
              d={`M${cx} ${cy + size * 0.1} Q${cx + Math.cos(rad) * r * 0.35} ${cy + Math.sin(rad) * r * 0.55} ${tipX} ${tipY} 
                  Q${cx - Math.cos(rad) * r * 0.35} ${cy + Math.sin(rad) * r * 0.55} ${cx} ${cy + size * 0.1}`}
              fill={color}
              fillOpacity={opacity}
            />
          );
        })}
        <Circle cx={cx} cy={cy + size * 0.06} r={size * 0.08} fill={color} />
      </G>
    );
  };

  const renderLutealLotus = () => {
    const r = size * 0.34;
    const angles = [-90, -50, -130, -15, -165];
    return (
      <G>
        {angles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const tipX = cx + Math.cos(rad) * r;
          const tipY = cy + Math.sin(rad) * r * 0.85;
          const opacity = i === 0 ? 0.9 : i < 3 ? 0.7 : 0.5;
          return (
            <Path
              key={angle}
              d={`M${cx} ${cy + size * 0.08} Q${cx + Math.cos(rad) * r * 0.3} ${cy + Math.sin(rad) * r * 0.5} ${tipX} ${tipY} 
                  Q${cx - Math.cos(rad) * r * 0.3} ${cy + Math.sin(rad) * r * 0.5} ${cx} ${cy + size * 0.08}`}
              fill={color}
              fillOpacity={opacity}
            />
          );
        })}
        <Circle cx={cx} cy={cy + size * 0.05} r={size * 0.065} fill={color} />
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

export function LotusIcon({ phase, size = 20, color = BRAND_PINK }: LotusProps) {
  return <Lotus phase={phase} size={size} color={color} />;
}

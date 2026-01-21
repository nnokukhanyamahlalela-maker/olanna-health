import React from "react";
import Svg, { Path, G } from "react-native-svg";

interface LotusProps {
  phase: "menstrual" | "follicular" | "ovulation" | "luteal";
  size?: number;
  color?: string;
}

const BRAND_PINK = "#F6A9D2";

export function Lotus({ phase, size = 80, color = BRAND_PINK }: LotusProps) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 100;

  const renderMenstrualLotus = () => {
    return (
      <G transform={`translate(${cx - 40 * scale}, ${cy - 35 * scale}) scale(${scale})`}>
        <Path
          d="M40 70 Q30 50 40 25 Q50 50 40 70"
          fill={color}
          fillOpacity={0.9}
        />
        <Path
          d="M40 70 Q20 55 25 35 Q35 45 40 70"
          fill={color}
          fillOpacity={0.7}
        />
        <Path
          d="M40 70 Q60 55 55 35 Q45 45 40 70"
          fill={color}
          fillOpacity={0.7}
        />
      </G>
    );
  };

  const renderFollicularLotus = () => {
    return (
      <G transform={`translate(${cx - 40 * scale}, ${cy - 35 * scale}) scale(${scale})`}>
        <Path
          d="M40 70 Q30 45 40 20 Q50 45 40 70"
          fill={color}
          fillOpacity={0.95}
        />
        <Path
          d="M40 70 Q15 50 20 28 Q32 42 40 70"
          fill={color}
          fillOpacity={0.75}
        />
        <Path
          d="M40 70 Q65 50 60 28 Q48 42 40 70"
          fill={color}
          fillOpacity={0.75}
        />
        <Path
          d="M40 70 Q8 58 12 40 Q28 48 40 70"
          fill={color}
          fillOpacity={0.55}
        />
        <Path
          d="M40 70 Q72 58 68 40 Q52 48 40 70"
          fill={color}
          fillOpacity={0.55}
        />
      </G>
    );
  };

  const renderOvulationLotus = () => {
    return (
      <G transform={`translate(${cx - 40 * scale}, ${cy - 35 * scale}) scale(${scale})`}>
        <Path
          d="M40 70 Q32 40 40 12 Q48 40 40 70"
          fill={color}
          fillOpacity={1}
        />
        <Path
          d="M40 70 Q10 45 15 20 Q30 38 40 70"
          fill={color}
          fillOpacity={0.85}
        />
        <Path
          d="M40 70 Q70 45 65 20 Q50 38 40 70"
          fill={color}
          fillOpacity={0.85}
        />
        <Path
          d="M40 70 Q0 55 5 32 Q25 45 40 70"
          fill={color}
          fillOpacity={0.65}
        />
        <Path
          d="M40 70 Q80 55 75 32 Q55 45 40 70"
          fill={color}
          fillOpacity={0.65}
        />
        <Path
          d="M40 70 Q-5 65 2 48 Q22 52 40 70"
          fill={color}
          fillOpacity={0.45}
        />
        <Path
          d="M40 70 Q85 65 78 48 Q58 52 40 70"
          fill={color}
          fillOpacity={0.45}
        />
      </G>
    );
  };

  const renderLutealLotus = () => {
    return (
      <G transform={`translate(${cx - 40 * scale}, ${cy - 35 * scale}) scale(${scale})`}>
        <Path
          d="M40 70 Q32 45 40 18 Q48 45 40 70"
          fill={color}
          fillOpacity={0.9}
        />
        <Path
          d="M40 70 Q18 52 22 30 Q33 44 40 70"
          fill={color}
          fillOpacity={0.7}
        />
        <Path
          d="M40 70 Q62 52 58 30 Q47 44 40 70"
          fill={color}
          fillOpacity={0.7}
        />
        <Path
          d="M40 70 Q10 60 15 42 Q30 50 40 70"
          fill={color}
          fillOpacity={0.5}
        />
        <Path
          d="M40 70 Q70 60 65 42 Q50 50 40 70"
          fill={color}
          fillOpacity={0.5}
        />
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

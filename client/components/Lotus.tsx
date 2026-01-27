import React from "react";
import Svg, { Path, G, Circle } from "react-native-svg";

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

interface LotusProps {
  phase: CyclePhase;
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

const CHARCOAL = "#3A3530";

export const PHASE_INFO = {
  menstrual: {
    title: "Rest & Release",
    subtitle: "This is the wisdom phase.",
    description: "A time for introspection and honoring your body's need for rest.",
  },
  follicular: {
    title: "Growth & Renewal",
    subtitle: "This is the becoming phase.",
    description: "Energy rises as your body prepares for new possibilities.",
  },
  ovulation: {
    title: "Radiance & Expression",
    subtitle: "This is the radiance phase.",
    description: "Your energy peaks - embrace connection and creativity.",
  },
  luteal: {
    title: "Boundaries & Reflection",
    subtitle: "This is the refinement phase.",
    description: "A time to complete projects and turn inward.",
  },
};

export function Lotus({ 
  phase, 
  size = 120, 
  strokeColor = CHARCOAL,
  strokeWidth = 1.2
}: LotusProps) {
  const viewBoxSize = 100;
  const cx = viewBoxSize / 2;
  const stemBase = 85;

  const renderMenstrualLotus = () => {
    return (
      <G>
        <Path
          d="M50 65 Q50 45 50 35 Q42 40 38 50 Q36 58 42 64 Q46 66 50 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 65 Q50 42 50 32 Q58 37 62 48 Q64 58 58 64 Q54 66 50 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 65 Q50 40 50 28 Q50 38 50 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${cx} ${stemBase - 20} L${cx} ${stemBase}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M48 67 Q45 70 42 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M52 67 Q55 70 58 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderFollicularLotus = () => {
    return (
      <G>
        <Path
          d="M50 60 Q50 40 50 25 Q40 35 38 48 Q38 56 44 60 Q47 62 50 60"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 60 Q50 40 50 25 Q60 35 62 48 Q62 56 56 60 Q53 62 50 60"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M44 62 Q38 45 32 35 Q28 45 32 55 Q36 62 44 62"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M56 62 Q62 45 68 35 Q72 45 68 55 Q64 62 56 62"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M38 64 Q32 52 25 45 Q22 55 28 62 Q34 66 38 64"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M62 64 Q68 52 75 45 Q78 55 72 62 Q66 66 62 64"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${cx} ${stemBase - 22} L${cx} ${stemBase}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M46 65 Q42 70 38 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M54 65 Q58 70 62 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderOvulationLotus = () => {
    return (
      <G>
        <Path
          d="M50 55 Q50 35 50 20 Q45 30 44 42 Q44 52 50 55"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 55 Q50 35 50 20 Q55 30 56 42 Q56 52 50 55"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M46 58 Q38 42 35 28 Q28 38 32 50 Q36 58 46 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M54 58 Q62 42 65 28 Q72 38 68 50 Q64 58 54 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M40 62 Q28 52 22 40 Q15 50 22 60 Q30 66 40 62"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M60 62 Q72 52 78 40 Q85 50 78 60 Q70 66 60 62"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M35 65 Q18 60 12 50 Q8 62 18 68 Q28 70 35 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M65 65 Q82 60 88 50 Q92 62 82 68 Q72 70 65 65"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${cx} ${stemBase - 24} L${cx} ${stemBase}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M44 68 Q38 73 32 70"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M56 68 Q62 73 68 70"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
      </G>
    );
  };

  const renderLutealLotus = () => {
    return (
      <G>
        <Path
          d="M50 58 Q50 38 50 24 Q43 34 42 46 Q42 54 48 58 Q50 60 50 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M50 58 Q50 38 50 24 Q57 34 58 46 Q58 54 52 58 Q50 60 50 58"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M44 60 Q36 44 32 32 Q26 44 32 54 Q38 62 44 60"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M56 60 Q64 44 68 32 Q74 44 68 54 Q62 62 56 60"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M38 63 Q28 52 22 42 Q18 54 26 62 Q34 66 38 63"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M62 63 Q72 52 78 42 Q82 54 74 62 Q66 66 62 63"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${cx} ${stemBase - 23} L${cx} ${stemBase}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M46 66 Q40 70 36 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M54 66 Q60 70 64 68"
          stroke={strokeColor}
          strokeWidth={strokeWidth * 0.8}
          fill="none"
          strokeLinecap="round"
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
    <Svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
    >
      {renderLotus()}
    </Svg>
  );
}

export function LotusIcon({ phase, size = 24, strokeColor = CHARCOAL }: LotusProps) {
  return <Lotus phase={phase} size={size} strokeColor={strokeColor} strokeWidth={1.5} />;
}

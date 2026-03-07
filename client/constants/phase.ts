import { phase } from "@/constants/colors";
import type { Phase } from "@/constants/phaseConfig";

export type PhaseName = "menstrual" | "follicular" | "ovulatory" | "luteal";

const phaseToName: Record<Phase, PhaseName> = {
  menstrual: "menstrual",
  follicular: "follicular",
  ovulation: "ovulatory",
  luteal: "luteal",
  late: "luteal",
};

export function toPhaseName(p: Phase): PhaseName {
  return phaseToName[p];
}

export function getPhaseGradient(p: PhaseName): [string, string, string] {
  return [phase[p].gradientStart, phase[p].gradientMid, phase[p].gradientEnd];
}

export function getPhaseSolid(p: PhaseName): string {
  return phase[p].solid;
}

export function getPhaseSoftBg(p: PhaseName): string {
  return phase[p].softBg;
}

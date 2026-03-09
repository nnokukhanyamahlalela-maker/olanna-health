import type { CycleProfile, FlowLog } from "@/types/cycle";

function parseDate(s: string): Date {
  return new Date(s + "T00:00:00");
}

export function getEffectiveLastPeriodStart(
  profile: CycleProfile,
  logs: FlowLog[]
): string {
  const logsWithFlow = logs
    .filter((l) => l.flow)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (logsWithFlow.length === 0) return profile.lastPeriodStart;

  let streakStart = logsWithFlow[0].date;
  for (let i = 1; i < logsWithFlow.length; i++) {
    const prev = parseDate(logsWithFlow[i - 1].date);
    const curr = parseDate(logsWithFlow[i].date);
    const gap = Math.round(
      (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (gap <= 1) {
      streakStart = logsWithFlow[i].date;
    } else {
      break;
    }
  }

  return streakStart > profile.lastPeriodStart
    ? streakStart
    : profile.lastPeriodStart;
}

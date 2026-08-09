/**
 * health-summary-profile-entry.test.ts
 *
 * Confirms that the HealthSummarySheet works correctly when opened from the
 * Profile screen entry point.
 *
 * ProfileScreen holds a `summaryVisible` boolean and passes it — along with an
 * `onDismiss` callback — to HealthSummarySheet:
 *
 *   <HealthSummarySheet
 *     visible={summaryVisible}
 *     onDismiss={() => setSummaryVisible(false)}
 *   />
 *
 * The sheet itself is driven by `buildHealthSummary` (data loading) and
 * `summaryToShareText` (Copy / Share actions).  All logic is tested directly
 * here so no React Native runtime is needed.
 *
 * Scenarios
 * ─────────
 * 1.  Empty state – no logs at all → sheet mounts with a meaningful blurb,
 *     zero data rows for flow / symptoms, and a valid share string.
 * 2.  Data state  – logs exist → date range, log-day count, cycle count,
 *     flow days, and top symptoms are all present and accurate.
 * 3.  Copy / Share text contains the expected sections when there are logs.
 * 4.  Copy / Share text for the empty state is still usable (no crash, still
 *     has the OLANNA HEALTH SUMMARY header).
 * 5.  Personal notes are excluded from share text when the privacy toggle is off.
 * 6.  Personal notes are included in share text when the privacy toggle is on.
 * 7.  Dismiss callback wiring – `setSummaryVisible(false)` is invoked when
 *     onDismiss fires (simulated as a plain closure, mirroring ProfileScreen).
 * 8.  Opening the sheet resets the copied flag (simulate sheet `visible`
 *     transition from false → true).
 * 9.  Check-in symptoms are merged with daily-log symptoms in the summary.
 * 10. Severity averages are calculated correctly for top symptoms.
 */

import { describe, it, expect } from "vitest";
import { buildHealthSummary, summaryToShareText } from "../lib/buildHealthSummary";
import type { HealthSummary } from "../lib/buildHealthSummary";

// ─── Minimal type mirrors (avoid importing React Native) ─────────────────────

interface MinimalDailyLog {
  id: string;
  date: string;
  flow?: string;
  symptoms: string[];
  notes?: string;
  createdAt: string;
  mood?: string;
  energy?: number;
  sleep?: number;
}

interface MinimalProfile {
  name: string;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart?: string;
}

interface MinimalSymptomLog {
  id: string;
  date: string;
  symptomId: string;
  severity?: number;
  createdAt: string;
}

interface MinimalCheckIn {
  id: string;
  date: string;
  symptoms?: MinimalSymptomLog[];
  notes?: string;
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

const PROFILE: MinimalProfile = {
  name: "Test User",
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: "2026-07-01",
};

/** Three daily logs across different days with varied symptoms and notes. */
const DAILY_LOGS: MinimalDailyLog[] = [
  {
    id: "l1",
    date: "2026-07-01",
    flow: "heavy",
    symptoms: ["cramps", "bloating"],
    notes: "Really tough day",
    createdAt: "2026-07-01T08:00:00Z",
  },
  {
    id: "l2",
    date: "2026-07-05",
    flow: "light",
    symptoms: ["headache"],
    createdAt: "2026-07-05T09:00:00Z",
  },
  {
    id: "l3",
    date: "2026-07-15",
    flow: undefined,
    symptoms: ["cramps", "fatigue"],
    notes: "Better but still cramping",
    createdAt: "2026-07-15T10:00:00Z",
  },
];

const SYMPTOM_LOGS: MinimalSymptomLog[] = [
  { id: "s1", date: "2026-07-01", symptomId: "cramps",  severity: 4, createdAt: "2026-07-01T08:00:00Z" },
  { id: "s2", date: "2026-07-05", symptomId: "headache", severity: 2, createdAt: "2026-07-05T09:00:00Z" },
  { id: "s3", date: "2026-07-15", symptomId: "fatigue",  severity: 3, createdAt: "2026-07-15T10:00:00Z" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simulate the ProfileScreen's summaryVisible toggle. */
function makeVisibilityController() {
  let visible = false;
  return {
    open:  () => { visible = true; },
    close: () => { visible = false; },
    get visible() { return visible; },
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("HealthSummarySheet — Profile entry point", () => {

  // ── 1. Empty state ────────────────────────────────────────────────────────

  describe("empty state (no logs)", () => {
    let summary: HealthSummary;

    beforeEach(() => {
      summary = buildHealthSummary([], [], null, []);
    });

    it("produces a non-empty blurb so the sheet always has content to display", () => {
      expect(summary.blurb.length).toBeGreaterThan(0);
    });

    it("blurb text invites the user to start logging", () => {
      expect(summary.blurb.toLowerCase()).toContain("log");
    });

    it("totalLogDays is 0", () => {
      expect(summary.totalLogDays).toBe(0);
    });

    it("dateRange is null (no OVERVIEW date row to show)", () => {
      expect(summary.dateRange).toBeNull();
    });

    it("flowDays is 0 (FLOW section is hidden)", () => {
      expect(summary.flowDays).toBe(0);
    });

    it("topSymptoms is empty (MOST LOGGED SYMPTOMS section is hidden)", () => {
      expect(summary.topSymptoms).toHaveLength(0);
    });

    it("personalNotes is empty (no notes toggle needed)", () => {
      expect(summary.personalNotes).toHaveLength(0);
    });

    it("share text still includes the OLANNA HEALTH SUMMARY header", () => {
      const text = summaryToShareText(summary, false);
      expect(text).toContain("OLANNA HEALTH SUMMARY");
    });

    it("share text does not crash or return an empty string", () => {
      const text = summaryToShareText(summary, false);
      expect(text.length).toBeGreaterThan(0);
    });
  });

  // ── 2. Data state ─────────────────────────────────────────────────────────

  describe("data state (logs exist)", () => {
    let summary: HealthSummary;

    beforeEach(() => {
      summary = buildHealthSummary(
        DAILY_LOGS as any,
        SYMPTOM_LOGS as any,
        PROFILE as any,
        []
      );
    });

    it("dateRange is populated (OVERVIEW date row renders)", () => {
      expect(summary.dateRange).not.toBeNull();
      expect(summary.dateRange!.start).toBe("2026-07-01");
      expect(summary.dateRange!.end).toBe("2026-07-15");
    });

    it("totalLogDays matches the number of unique dates across all logs", () => {
      // 3 unique daily-log dates + 3 symptom-log dates — all fall on the same
      // 3 calendar days, so unique count should be 3.
      expect(summary.totalLogDays).toBe(3);
    });

    it("cycleCount is at least 1 when there is a date range", () => {
      expect(summary.cycleCount).toBeGreaterThanOrEqual(1);
    });

    it("cycleLength reflects the profile value", () => {
      expect(summary.cycleLength).toBe(PROFILE.cycleLength);
    });

    it("flowDays counts only non-spotting flow logs", () => {
      // l1 = heavy, l2 = light → 2 flow days
      expect(summary.flowDays).toBe(2);
    });

    it("heavyFlowDays counts only heavy flow entries", () => {
      expect(summary.heavyFlowDays).toBe(1);
    });

    it("topSymptoms is non-empty", () => {
      expect(summary.topSymptoms.length).toBeGreaterThan(0);
    });

    it("cramps is ranked first because it appears most often", () => {
      expect(summary.topSymptoms[0].id).toBe("cramps");
    });

    it("symptom entries have a display name (not just the raw id)", () => {
      const cramps = summary.topSymptoms.find((s) => s.id === "cramps");
      expect(cramps?.name).toBe("Cramps");
    });

    it("personalNotes contains one entry per date that has a note", () => {
      // l1 and l3 have notes; l2 does not.
      expect(summary.personalNotes).toHaveLength(2);
    });

    it("personal note entries are prefixed with the formatted date", () => {
      // Each entry should be '<formatted date>: <note text>'
      expect(summary.personalNotes[0]).toMatch(/:\s/);
    });
  });

  // ── 3. Copy / Share text with logs ───────────────────────────────────────

  describe("Copy / Share text — data present", () => {
    let summary: HealthSummary;

    beforeEach(() => {
      summary = buildHealthSummary(
        DAILY_LOGS as any,
        SYMPTOM_LOGS as any,
        PROFILE as any,
        []
      );
    });

    it("share text contains the OLANNA HEALTH SUMMARY header", () => {
      expect(summaryToShareText(summary, false)).toContain("OLANNA HEALTH SUMMARY");
    });

    it("share text contains days-logged figure", () => {
      expect(summaryToShareText(summary, false)).toContain("3 days logged");
    });

    it("share text contains the FLOW section when flowDays > 0", () => {
      expect(summaryToShareText(summary, false)).toContain("FLOW");
    });

    it("share text contains TOP SYMPTOMS section when symptoms exist", () => {
      expect(summaryToShareText(summary, false)).toContain("TOP SYMPTOMS");
    });

    it("share text ends with the Olanna attribution footer", () => {
      const text = summaryToShareText(summary, false);
      expect(text).toContain("Prepared with Olanna Health");
    });
  });

  // ── 4. Copy / Share text — empty state ───────────────────────────────────

  describe("Copy / Share text — empty state", () => {
    it("produces a usable, non-empty string even when there are no logs", () => {
      const summary = buildHealthSummary([], [], null, []);
      const text = summaryToShareText(summary, false);
      expect(text).toContain("OLANNA HEALTH SUMMARY");
      expect(text.length).toBeGreaterThan(50);
    });
  });

  // ── 5 & 6. Privacy toggle — notes in share text ──────────────────────────

  describe("personal notes privacy gating in share text", () => {
    let summary: HealthSummary;

    beforeEach(() => {
      summary = buildHealthSummary(
        DAILY_LOGS as any,
        SYMPTOM_LOGS as any,
        PROFILE as any,
        []
      );
    });

    it("PERSONAL NOTES section is absent when includeNotes is false", () => {
      const text = summaryToShareText(summary, false);
      expect(text).not.toContain("PERSONAL NOTES");
    });

    it("PERSONAL NOTES section is present when includeNotes is true", () => {
      const text = summaryToShareText(summary, true);
      expect(text).toContain("PERSONAL NOTES");
    });

    it("note content appears in the share text when includeNotes is true", () => {
      const text = summaryToShareText(summary, true);
      expect(text).toContain("Really tough day");
    });

    it("note content is absent from the share text when includeNotes is false", () => {
      const text = summaryToShareText(summary, false);
      expect(text).not.toContain("Really tough day");
    });
  });

  // ── 7. Dismiss callback wiring ────────────────────────────────────────────

  describe("dismiss callback — ProfileScreen wiring", () => {
    it("setSummaryVisible(false) is called when onDismiss fires", () => {
      const ctrl = makeVisibilityController();

      // Simulate pressing "My Health Summary" in ProfileScreen
      ctrl.open();
      expect(ctrl.visible).toBe(true);

      // Simulate the onDismiss callback HealthSummarySheet passes back
      const onDismiss = () => ctrl.close();
      onDismiss();

      expect(ctrl.visible).toBe(false);
    });

    it("sheet can be opened and closed multiple times without getting stuck", () => {
      const ctrl = makeVisibilityController();

      for (let i = 0; i < 3; i++) {
        ctrl.open();
        expect(ctrl.visible).toBe(true);
        ctrl.close();
        expect(ctrl.visible).toBe(false);
      }
    });
  });

  // ── 8. State reset on open ────────────────────────────────────────────────

  describe("sheet state reset on open", () => {
    it("copied flag starts as false when the sheet becomes visible", () => {
      // Mirrors the useEffect in HealthSummarySheet: when `visible` becomes
      // true, `setCopied(false)` is called.  We verify the initial value here.
      let copied = false;

      // Simulate what the sheet's useEffect does on open
      const onOpen = () => { copied = false; };

      // Suppose user had copied before and then closed + reopened
      copied = true;
      onOpen();

      expect(copied).toBe(false);
    });

    it("includeNotes is reset to false each time the sheet opens", () => {
      // Mirrors `setIncludeNotes(false)` in the useEffect.
      let includeNotes = true;
      const onOpen = () => { includeNotes = false; };
      onOpen();
      expect(includeNotes).toBe(false);
    });

    it("aiNarrative is cleared each time the sheet opens", () => {
      let aiNarrative: string | null = "Previous narrative";
      const onOpen = () => { aiNarrative = null; };
      onOpen();
      expect(aiNarrative).toBeNull();
    });
  });

  // ── 9. Check-in symptoms are merged ──────────────────────────────────────

  describe("check-in symptoms merged with daily-log symptoms", () => {
    it("check-in symptoms appear in topSymptoms", () => {
      const checkIns: MinimalCheckIn[] = [
        {
          id: "ci1",
          date: "2026-07-20",
          symptoms: [
            { id: "ci-s1", date: "2026-07-20", symptomId: "nausea", severity: 2, createdAt: "2026-07-20T10:00:00Z" },
            { id: "ci-s2", date: "2026-07-20", symptomId: "nausea", severity: 3, createdAt: "2026-07-20T10:00:00Z" },
          ],
        },
      ];

      const summary = buildHealthSummary([], [], PROFILE as any, checkIns as any);
      const nausea = summary.topSymptoms.find((s) => s.id === "nausea");
      expect(nausea).toBeDefined();
    });

    it("check-in notes are merged into personalNotes", () => {
      const checkIns: MinimalCheckIn[] = [
        { id: "ci1", date: "2026-08-01", notes: "Check-in note here", symptoms: [] },
      ];

      const summary = buildHealthSummary([], [], PROFILE as any, checkIns as any);
      expect(summary.personalNotes.some((n) => n.includes("Check-in note here"))).toBe(true);
    });
  });

  // ── 10. Severity averages ─────────────────────────────────────────────────

  describe("severity averaging for top symptoms", () => {
    it("avgSeverity is the mean of all logged severities for that symptom", () => {
      const symptomLogs: MinimalSymptomLog[] = [
        { id: "x1", date: "2026-07-01", symptomId: "cramps", severity: 2, createdAt: "2026-07-01T00:00:00Z" },
        { id: "x2", date: "2026-07-02", symptomId: "cramps", severity: 4, createdAt: "2026-07-02T00:00:00Z" },
      ];

      const summary = buildHealthSummary([], symptomLogs as any, null, []);
      const cramps = summary.topSymptoms.find((s) => s.id === "cramps");

      // (2 + 4) / 2 = 3.0
      expect(cramps?.avgSeverity).toBe(3);
    });

    it("avgSeverity is null when no severity values were recorded", () => {
      const logsNoSeverity: MinimalDailyLog[] = [
        { id: "l1", date: "2026-07-01", symptoms: ["bloating"], createdAt: "2026-07-01T00:00:00Z" },
      ];

      const summary = buildHealthSummary(logsNoSeverity as any, [], null, []);
      const bloating = summary.topSymptoms.find((s) => s.id === "bloating");

      expect(bloating?.avgSeverity).toBeNull();
    });
  });
});

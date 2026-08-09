/**
 * health-summary-profile-entry.test.tsx
 *
 * Component-level regression guard confirming that HealthSummarySheet opens,
 * displays data, and closes correctly when triggered from ProfileScreen — the
 * Profile entry point rather than the Home entry point.
 *
 * Strategy
 * ────────
 * • react-native is mocked to react-native-web CJS so no Flow-typed source
 *   reaches Node.  Modal is made transparent (renders children when visible).
 * • All expo / navigation / internal components are mocked to lightweight stubs.
 * • HealthSummarySheet is NOT mocked — the real component is rendered so
 *   content assertions work; its props are inspected via renderer.root.findByType().
 * • Storage modules are mocked via vi.mock with factories that don't reference
 *   outer variables (hoisting guard); default values are set in beforeEach.
 *
 * Scenarios
 * ─────────
 * Profile → sheet wiring
 *   1. HealthSummarySheet.props.visible is false when ProfileScreen first mounts.
 *   2. Pressing "My Health Summary" sets props.visible to true on the sheet.
 *   3. Calling the onDismiss prop ProfileScreen passes sets props.visible back to false.
 *   4. Sheet can be opened and closed multiple times without getting stuck.
 *
 * HealthSummarySheet — data loaded state
 *   5. "OVERVIEW" section header is rendered once data loads.
 *   6. "Days logged" data row is rendered.
 *   7. "Copy" action button is rendered.
 *   8. "Share with provider" action button is rendered.
 *   9. Pressing a dismiss-wired Pressable invokes the onDismiss callback.
 *
 * HealthSummarySheet — empty state (no logs)
 *  10. Sheet renders without throwing when storage returns no logs.
 *  11. OVERVIEW section still appears in the empty state.
 */

// ─── react-native → react-native-web CJS ────────────────────────────────────
// Must be the FIRST vi.mock so every node_module (including react-native-reanimated)
// gets the web-compatible build rather than the Flow-typed source.
vi.mock("react-native", async () => {
  const rnw = (await import("react-native-web/dist/cjs/index.js")) as any;
  return {
    ...rnw,
    // Modal: transparent wrapper so sheet body appears in the test-renderer tree.
    Modal: ({ children, visible }: any) => (visible ? children ?? null : null),
    // These are unavailable / unnecessary in Node.
    Share: { share: async () => ({ action: "sharedAction" }) },
    Alert: { alert: () => {} },
  };
});

// ─── expo / community / navigation mocks ─────────────────────────────────────

vi.mock("expo-haptics", () => ({
  impactAsync: vi.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
}));

vi.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: any) => children ?? null,
}));

vi.mock("expo-blur", () => ({
  BlurView: ({ children }: any) => children ?? null,
}));

vi.mock("expo-clipboard", () => ({
  setStringAsync: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@expo/vector-icons", () => ({
  Feather: (_props: any) => null,
}));

vi.mock("react-native-reanimated", () => ({
  __esModule: true,
  default: {
    View:                      ({ children }: any) => children ?? null,
    createAnimatableComponent: (C: any) => C,
  },
  FadeInDown:       { duration: () => ({ springify: () => ({}) }) },
  useSharedValue:   (v: any) => ({ value: v }),
  useAnimatedStyle: (fn: any) => (typeof fn === "function" ? fn() : {}),
  withSpring:       (v: any) => v,
  withTiming:       (v: any) => v,
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider:  ({ children }: any) => children,
  SafeAreaView:      ({ children }: any) => children,
}));

vi.mock("@react-navigation/elements", () => ({
  useHeaderHeight: () => 0,
}));

const mockNavigate = vi.fn();
const mockReplace  = vi.fn();
vi.mock("@react-navigation/native", () => ({
  useNavigation:  () => ({ navigate: mockNavigate, replace: mockReplace }),
  useFocusEffect: (cb: () => () => void) => { cb(); },
  NavigationContainer: ({ children }: any) => children,
}));

vi.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children }: any) => children,
  KeyboardProvider:        ({ children }: any) => children,
}));

// ─── Internal component mocks ─────────────────────────────────────────────────

vi.mock("@/components/AppGradient", () => ({
  AppGradient: ({ children }: any) => children ?? null,
}));

vi.mock("@/components/GlassSurface", () => ({
  GlassSurface: ({ children }: any) => children ?? null,
}));

vi.mock("@/components/ThemedText", () => ({
  ThemedText: ({ children }: any) => children ?? null,
}));

vi.mock("@/components/Button", () => ({
  Button: ({ children, onPress }: any) => children ?? null,
}));

vi.mock("@/components/KeyboardAwareScrollViewCompat", () => ({
  KeyboardAwareScrollViewCompat: ({ children }: any) => children ?? null,
}));

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({
    theme: {
      text: "#26215C",
      textSecondary: "#6B6591",
      backgroundDefault: "#FAF8F3",
      border: "#F0E4EC",
      primary: "#D85A30",
      error: "#D32F2F",
    },
    isDark: false,
    preset: "blossom",
    presetName: "Blossom",
  }),
}));

vi.mock("@/hooks/useColorScheme", () => ({
  useColorScheme: () => "light",
}));

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: {
      text: "#26215C",
      textSecondary: "#6B6591",
      backgroundDefault: "#FAF8F3",
      border: "#F0E4EC",
      primary: "#D85A30",
    },
    isDark: false,
  }),
}));

// Storage mocks — no outer-constant references (factories are hoisted).
vi.mock("@/lib/storage", () => ({
  storage: {
    getUserProfile: vi.fn(),
    getDailyLogs:   vi.fn(),
    clearAllData:   vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/symptomStorage", () => ({
  getSymptomLogs:   vi.fn(),
  getDailyCheckIns: vi.fn(),
}));

vi.mock("@/lib/privacyStorage", () => ({
  privacyStorage: { shareExportedData: vi.fn().mockResolvedValue(true) },
}));

vi.mock("@/lib/query-client", () => ({
  getApiUrl:   () => "http://localhost:3000",
  queryClient: {},
}));

// ─── Imports (must follow vi.mock declarations) ───────────────────────────────

import React from "react";
import { create, act } from "react-test-renderer";
import { storage }                          from "@/lib/storage";
import { getSymptomLogs, getDailyCheckIns } from "@/lib/symptomStorage";
import ProfileScreen                        from "../screens/ProfileScreen";
import { HealthSummarySheet }               from "../components/HealthSummarySheet";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const MOCK_PROFILE = {
  id: "u1",
  name: "Alice",
  dateOfBirth: "1990-01-01",
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: "2026-07-01",
  healthGoals: [],
  hasPCOS: false,
  hasEndometriosis: false,
  createdAt: "2026-01-01T00:00:00Z",
};

const MOCK_DAILY_LOGS = [
  { id: "l1", date: "2026-07-01", flow: "heavy", symptoms: ["cramps"],   createdAt: "2026-07-01T08:00:00Z" },
  { id: "l2", date: "2026-07-05", flow: "light", symptoms: ["headache"], createdAt: "2026-07-05T09:00:00Z" },
];

// ─── Tree helpers ─────────────────────────────────────────────────────────────

/**
 * Recursively collect component INSTANCES (from renderer.root) whose props
 * satisfy the predicate.  Use this for finding Pressable instances by onPress
 * since react-native-web renders Pressable as a DOM div (onClick), so the
 * component-instance tree is the only reliable place to find onPress.
 */
function findInstances(instance: any, predicate: (i: any) => boolean): any[] {
  if (!instance || typeof instance !== "object") return [];
  const hits = predicate(instance) ? [instance] : [];
  const children: any[] = Array.isArray(instance.children) ? instance.children : [];
  return hits.concat(
    ...children.map((c) => (typeof c === "object" ? findInstances(c, predicate) : []))
  );
}

/** Find all component instances that have an onPress prop. */
function findPressableInstances(root: any): any[] {
  return findInstances(root, (i) => typeof i.props?.onPress === "function");
}

/**
 * Serialize a component instance subtree to a plain string (joining all string
 * children recursively).  Used to determine if a pressable "contains" a label.
 */
function instanceText(instance: any): string {
  if (!instance) return "";
  if (typeof instance === "string") return instance;
  const parts: string[] = [];
  const children: any[] = Array.isArray(instance.children) ? instance.children : [];
  for (const c of children) {
    parts.push(instanceText(c));
  }
  return parts.join("");
}

// ─── JSON-tree helpers (for content assertions) ───────────────────────────────

/**
 * Recursively collect every node in the JSON tree (from toJSON()) that
 * satisfies the predicate.
 */
function findInJSON(node: any, predicate: (n: any) => boolean): any[] {
  if (node === null || node === undefined) return [];
  if (typeof node === "string") return predicate(node as any) ? [node] : [];
  if (Array.isArray(node)) return node.flatMap((n) => findInJSON(n, predicate));
  const hits = predicate(node) ? [node] : [];
  const children = Array.isArray(node.children) ? node.children : [];
  return hits.concat(children.flatMap((c: any) => findInJSON(c, predicate)));
}

/**
 * Return true if the JSON tree (from toJSON()) contains at least one node
 * whose direct or deeply nested children include `text`.
 */
function hasText(root: any, text: string): boolean {
  return findInJSON(root, (n: any) => {
    if (typeof n === "string") return n.includes(text);
    const c = n?.props?.children;
    if (typeof c === "string") return c.includes(text);
    if (Array.isArray(c)) return c.some((x: any) => typeof x === "string" && x.includes(text));
    return false;
  }).length > 0;
}

/** Safe toJSON wrapper — normalises array / null roots. */
function getJSON(renderer: any): any {
  const json = renderer.toJSON();
  if (!json) return { props: {}, children: [] };
  if (Array.isArray(json)) return { props: {}, children: json };
  return json;
}

// ─── Tests: ProfileScreen → HealthSummarySheet wiring ────────────────────────
//
// HealthSummarySheet is NOT mocked — the real component is rendered inside
// ProfileScreen.  We locate the sheet component instance via
// renderer.root.findByType(HealthSummarySheet) and inspect its props directly.
// This means any change to ProfileScreen's onPress, visible state, or prop
// wiring will immediately break these tests.

describe("ProfileScreen → HealthSummarySheet wiring", () => {
  beforeEach(() => {
    vi.mocked(storage.getUserProfile).mockResolvedValue(MOCK_PROFILE as any);
    vi.mocked(storage.getDailyLogs).mockResolvedValue(MOCK_DAILY_LOGS as any);
    vi.mocked(getSymptomLogs).mockResolvedValue([]);
    vi.mocked(getDailyCheckIns).mockResolvedValue([]);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ available: false }),
    }) as any;
  });

  /** Render ProfileScreen and return the renderer + the HealthSummarySheet instance. */
  async function renderProfile() {
    let renderer: any;
    await act(async () => {
      renderer = create(React.createElement(ProfileScreen));
    });
    const sheetInstance = renderer.root.findByType(HealthSummarySheet);
    return { renderer, sheetInstance };
  }

  it("1. props.visible is false when ProfileScreen first mounts", async () => {
    const { sheetInstance } = await renderProfile();
    expect(sheetInstance.props.visible).toBe(false);
  });

  it("2. Pressing 'My Health Summary' sets props.visible to true", async () => {
    const { renderer } = await renderProfile();

    // Search the component instance tree (not JSON) so that onPress is found
    // even though react-native-web renders Pressable as a DOM div with onClick.
    const pressables = findPressableInstances(renderer.root);
    const summaryPressable = pressables.find((p) =>
      instanceText(p).includes("My Health Summary")
    );
    expect(summaryPressable).toBeDefined();

    await act(async () => { summaryPressable!.props.onPress(); });

    const updated = renderer.root.findByType(HealthSummarySheet);
    expect(updated.props.visible).toBe(true);
  });

  it("3. Calling onDismiss sets props.visible back to false", async () => {
    const { renderer } = await renderProfile();

    const summaryPressable = findPressableInstances(renderer.root).find((p) =>
      instanceText(p).includes("My Health Summary")
    )!;

    // Open
    await act(async () => { summaryPressable.props.onPress(); });
    let updated = renderer.root.findByType(HealthSummarySheet);
    expect(updated.props.visible).toBe(true);

    // Dismiss via the callback ProfileScreen passes to the sheet
    await act(async () => { updated.props.onDismiss(); });
    updated = renderer.root.findByType(HealthSummarySheet);
    expect(updated.props.visible).toBe(false);
  });

  it("4. Sheet can be opened and closed multiple times without getting stuck", async () => {
    const { renderer } = await renderProfile();

    const summaryPressable = findPressableInstances(renderer.root).find((p) =>
      instanceText(p).includes("My Health Summary")
    )!;

    for (let i = 0; i < 3; i++) {
      await act(async () => { summaryPressable.props.onPress(); });
      let instance = renderer.root.findByType(HealthSummarySheet);
      expect(instance.props.visible).toBe(true);

      await act(async () => { instance.props.onDismiss(); });
      instance = renderer.root.findByType(HealthSummarySheet);
      expect(instance.props.visible).toBe(false);
    }
  });
});

// ─── Tests: HealthSummarySheet — data loaded ─────────────────────────────────

describe("HealthSummarySheet — data loaded (from Profile entry point)", () => {
  beforeEach(() => {
    vi.mocked(storage.getUserProfile).mockResolvedValue(MOCK_PROFILE as any);
    vi.mocked(storage.getDailyLogs).mockResolvedValue(MOCK_DAILY_LOGS as any);
    vi.mocked(getSymptomLogs).mockResolvedValue([]);
    vi.mocked(getDailyCheckIns).mockResolvedValue([]);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ available: false }),
    }) as any;
  });

  async function renderSheet(onDismiss = vi.fn()) {
    let renderer: any;
    await act(async () => {
      renderer = create(
        React.createElement(HealthSummarySheet, { visible: true, onDismiss })
      );
    });
    // Let the async storage load settle
    await act(async () => {});
    return renderer;
  }

  it("5. OVERVIEW section header appears once data loads", async () => {
    const renderer = await renderSheet();
    expect(hasText(getJSON(renderer), "OVERVIEW")).toBe(true);
  });

  it("6. 'Days logged' data row is rendered", async () => {
    const renderer = await renderSheet();
    expect(hasText(getJSON(renderer), "Days logged")).toBe(true);
  });

  it("7. 'Copy' action button is rendered", async () => {
    const renderer = await renderSheet();
    expect(hasText(getJSON(renderer), "Copy")).toBe(true);
  });

  it("8. 'Share with provider' action button is rendered", async () => {
    const renderer = await renderSheet();
    expect(hasText(getJSON(renderer), "Share with provider")).toBe(true);
  });

  it("9. Pressing a dismiss-wired Pressable invokes the onDismiss callback", async () => {
    const onDismiss  = vi.fn();
    const renderer   = await renderSheet(onDismiss);

    // Use the component instance tree so onPress is found even though
    // react-native-web renders Pressable as a DOM element with onClick.
    const pressables = findPressableInstances(renderer.root);

    // The sheet header has an X close button and there is a backdrop Pressable;
    // either one invokes onDismiss when pressed.
    for (const p of pressables) {
      try { p.props.onPress(); } catch { /* skip pressables that throw */ }
      if (onDismiss.mock.calls.length > 0) break;
    }
    expect(onDismiss).toHaveBeenCalled();
  });
});

// ─── Tests: HealthSummarySheet — empty state (no logs) ───────────────────────

describe("HealthSummarySheet — empty state (no logs)", () => {
  beforeEach(() => {
    vi.mocked(storage.getUserProfile).mockResolvedValue(null as any);
    vi.mocked(storage.getDailyLogs).mockResolvedValue([]);
    vi.mocked(getSymptomLogs).mockResolvedValue([]);
    vi.mocked(getDailyCheckIns).mockResolvedValue([]);
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ available: false }),
    }) as any;
  });

  it("10. Sheet renders without throwing when storage returns no logs", async () => {
    await expect(
      act(async () => {
        create(
          React.createElement(HealthSummarySheet, {
            visible:   true,
            onDismiss: vi.fn(),
          })
        );
      })
    ).resolves.not.toThrow();
  });

  it("11. OVERVIEW section still appears in the empty state", async () => {
    let renderer: any;
    await act(async () => {
      renderer = create(
        React.createElement(HealthSummarySheet, { visible: true, onDismiss: vi.fn() })
      );
    });
    await act(async () => {});
    expect(hasText(getJSON(renderer), "OVERVIEW")).toBe(true);
  });
});

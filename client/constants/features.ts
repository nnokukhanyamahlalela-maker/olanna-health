/**
 * Feature flags
 *
 * Toggle features on/off without deleting their underlying code.
 * Set a flag to `true` to re-enable the feature when it's ready.
 *
 * PERIMENOPAUSE_ENABLED — hidden until menopause research is complete.
 *   All perimenopause detection logic in lannaPatternEngine.ts and all
 *   content in lannaContent.ts remains intact; only the runtime call is
 *   gated here so it can be switched back on with a single line change.
 */
export const FEATURES = {
  PERIMENOPAUSE_ENABLED: false,
} as const;

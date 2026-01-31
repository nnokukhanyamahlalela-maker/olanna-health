export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  "2xl": 36,
  "3xl": 48,
} as const;

export const ScreenPadding = {
  horizontal: 20,
  bottomScroll: 36,
} as const;

export const CardSpacing = {
  padding: 20,
  radius: 24,
  gap: 12,
  sectionGap: 28,
} as const;

export const PillSpacing = {
  height: 44,
  paddingHorizontal: 16,
  gap: 8,
  radius: 999,
  minTapTarget: 44,
} as const;

export const ButtonSpacing = {
  height: 52,
  radius: 999,
  paddingHorizontal: 20,
} as const;

export const Layout = {
  screen: ScreenPadding,
  card: CardSpacing,
  pill: PillSpacing,
  button: ButtonSpacing,
} as const;

export type SpacingKey = keyof typeof Spacing;

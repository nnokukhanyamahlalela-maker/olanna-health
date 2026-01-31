import React from "react";
import { Text, TextProps, TextStyle, StyleSheet } from "react-native";
import { type, TypographyVariant, heroTextShadow } from "@/constants/typography";
import { useTheme } from "@/components/ThemeProvider";

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  onGradient?: boolean;
  color?: string;
}

export function AppText({
  variant = "body",
  onGradient = false,
  color,
  style,
  children,
  ...props
}: AppTextProps) {
  const { theme } = useTheme();
  const token = type[variant];

  const textColor = color ?? (onGradient ? theme.textOnGradient : theme.textPrimary);

  const textStyle: TextStyle = {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: token.fontWeight,
    letterSpacing: token.letterSpacing,
    color: textColor as string,
    ...(onGradient && variant === "display" ? heroTextShadow : {}),
  };

  return (
    <Text
      style={[textStyle, style]}
      allowFontScaling={true}
      maxFontSizeMultiplier={1.5}
      {...props}
    >
      {children}
    </Text>
  );
}

export function DisplayText({ style, ...props }: Omit<AppTextProps, "variant">) {
  return <AppText variant="display" onGradient={true} style={style} {...props} />;
}

export function HeadingText({ style, ...props }: Omit<AppTextProps, "variant">) {
  return <AppText variant="h1" style={style} {...props} />;
}

export function BodyText({ style, ...props }: Omit<AppTextProps, "variant">) {
  return <AppText variant="body" style={style} {...props} />;
}

export function CaptionText({ style, ...props }: Omit<AppTextProps, "variant">) {
  return <AppText variant="caption" style={style} {...props} />;
}

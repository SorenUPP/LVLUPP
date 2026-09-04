import { forwardRef } from "react";
import { Text as RNText, StyleSheet, type TextProps } from "react-native";

/**
 * Drop-in replacement for React Native's <Text> that makes Roboto the default
 * typeface app-wide.
 *
 * RN has no font inheritance and doesn't derive a font family from `fontWeight`,
 * so the right Roboto face has to be set explicitly on every Text. We resolve it
 * from the tailwind weight class (or an inline `fontWeight`) and inject the
 * matching family. `font-mono` is left alone — the `fontFamily.mono` config
 * already maps it to Roboto Mono.
 */

const BOLD = "Roboto_700Bold";
const MEDIUM = "Roboto_500Medium";
const REGULAR = "Roboto_400Regular";

const WEIGHT_FAMILY: Record<string, string> = {
  "500": MEDIUM,
  "600": MEDIUM,
  "700": BOLD,
  "800": BOLD,
  "900": BOLD,
  bold: BOLD,
};

function familyFromClassName(cn: string): string | null {
  if (/\bfont-mono\b/.test(cn)) return null;
  if (/\bfont-(?:bold|extrabold|black)\b/.test(cn)) return BOLD;
  if (/\bfont-(?:medium|semibold)\b/.test(cn)) return MEDIUM;
  return REGULAR;
}

export const Text = forwardRef<RNText, TextProps & { className?: string }>(function Text(
  { className, style, ...props },
  ref
) {
  const cn = typeof className === "string" ? className : "";

  let family: string | null;
  if (/\bfont-mono\b/.test(cn)) {
    family = null;
  } else if (/\bfont-/.test(cn)) {
    family = familyFromClassName(cn);
  } else {
    const flat = (StyleSheet.flatten(style) ?? {}) as {
      fontFamily?: string;
      fontWeight?: string | number;
    };
    if (flat.fontFamily) family = null;
    else family = WEIGHT_FAMILY[String(flat.fontWeight)] ?? REGULAR;
  }

  return (
    <RNText
      ref={ref}
      className={className}
      style={family ? [{ fontFamily: family }, style] : style}
      {...props}
    />
  );
});

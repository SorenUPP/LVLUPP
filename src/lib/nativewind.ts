/**
 * Register third-party components with NativeWind so `className` works on them.
 *
 * NativeWind's JSX runtime only maps `className` -> `style` for components it
 * knows about (the React Native core primitives + a few others). Anything else —
 * expo-blur's BlurView, expo-linear-gradient's LinearGradient — receives the
 * `className` string untouched and silently ignores it, which is why the
 * BlurView nav bar rendered unstyled (falling back to the default
 * `flexDirection: "column"`).
 *
 * Import this module once, before any of these components render (done from
 * app/_layout.tsx).
 */
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { remapProps } from "nativewind";

remapProps(BlurView, { className: "style" });
remapProps(LinearGradient, { className: "style" });

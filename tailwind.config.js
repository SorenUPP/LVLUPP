/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}", // <-- Add this line
    "./components/**/*.{js,jsx,ts,tsx}",
    "./App.tsx",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Base sans is applied by src/components/ui/Text.tsx; `font-mono` maps here.
        sans: ["Roboto_400Regular", "system-ui", "sans-serif"],
        mono: ["RobotoMono_400Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

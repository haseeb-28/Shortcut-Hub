import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0F1E",
          900: "#0A0F1E",
          800: "#0F1526",
          700: "#121A2E",
          600: "#17213A",
          500: "#1D2A47",
        },
        border: "#223052",
        amber: {
          DEFAULT: "#F2B705",
          soft: "#F7CE4A",
        },
        teal: {
          DEFAULT: "#4FD1C5",
        },
        ink2: "#8592AD",
        mist: "#E8ECF4",
        danger: "#F2555A",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(242,183,5,0.15), 0 8px 24px -8px rgba(242,183,5,0.25)",
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 20px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "runway-grid":
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      animation: {
        blink: "blink 1.1s steps(1) infinite",
        beacon: "beacon 1.8s ease-in-out infinite",
      },
      keyframes: {
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        beacon: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(242,183,5,0.5)" },
          "50%": { boxShadow: "0 0 0 6px rgba(242,183,5,0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

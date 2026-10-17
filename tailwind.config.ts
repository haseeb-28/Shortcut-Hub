import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "var(--background)",
          900: "var(--background)",
          800: "var(--surface)",
          700: "var(--surface-light)",
          600: "var(--surface-raised)",
          500: "var(--border)",
        },
        border: "var(--border)",
        button: "var(--button-text)",
        amber: {
          DEFAULT: "var(--amber)",
          soft: "var(--amber-soft)",
        },
        teal: {
          DEFAULT: "var(--teal)",
        },
        ink2: "var(--muted)",
        mist: "var(--mist)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px color-mix(in srgb, var(--accent) 28%, transparent), 0 0 0 4px color-mix(in srgb, var(--accent) 16%, transparent)",
        card: "8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--raised-highlight)",
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
          "0%, 100%": {
            boxShadow: "0 0 0 0 color-mix(in srgb, var(--accent) 50%, transparent)",
          },
          "50%": { boxShadow: "0 0 0 6px transparent" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0B0B0C",
        card: "#111214",
        glass: "rgba(255,255,255,0.03)",
        ink: "#FFFFFF",
        gold: "#C9A227",
        "gold-soft": "#E5C76B",
        success: "#1DBA74",
        danger: "#E5484D",
        process: "#3B82F6",
        muted: "#6B7280",
        secondary: "#A1A1AA",
        warning: "#E5484D",
      },
      boxShadow: {
        soft: "0 24px 70px rgba(0, 0, 0, 0.28)",
        gold: "0 0 42px rgba(201, 162, 39, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;

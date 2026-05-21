import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#e6fafe",
          100: "#b0f0fc",
          200: "#7ae5fa",
          300: "#44d9f7",
          400: "#0ecef5",
          500: "#00bcd4",
          600: "#00a0b8",
          700: "#00839b",
          800: "#00667e",
          900: "#004a61",
          950: "#002d3d",
        },
        accent: {
          gold: "#ffd700",
          coral: "#ff4d6a",
          mint: "#00e5a0",
          cyan: "#00d4ff",
        },
        surface: {
          DEFAULT: "#050a1a",
          50: "#0d1a2d",
          100: "#0a1628",
          200: "#101d33",
          300: "#162440",
          400: "#1c2b4d",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 60px -12px rgba(0, 212, 255, 0.4)",
        "glow-sm": "0 0 20px -4px rgba(0, 212, 255, 0.3)",
        "glow-gold": "0 0 40px -8px rgba(255, 215, 0, 0.3)",
        "glow-cyan": "0 0 30px -6px rgba(0, 212, 255, 0.35)",
        card: "0 4px 24px -4px rgba(0, 0, 0, 0.4), 0 8px 32px -8px rgba(0, 212, 255, 0.08)",
        "card-hover":
          "0 12px 40px -8px rgba(0, 0, 0, 0.5), 0 20px 50px -12px rgba(0, 212, 255, 0.15)",
        innerGlow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
      },
      backgroundImage: {
        "mesh-page":
          "radial-gradient(ellipse 120% 80% at 50% -30%, rgba(0, 212, 255, 0.08), transparent 50%), radial-gradient(ellipse 80% 50% at 100% 0%, rgba(0, 188, 212, 0.06), transparent 45%), radial-gradient(ellipse 60% 40% at 0% 20%, rgba(255, 215, 0, 0.04), transparent 40%)",
        "hero-mesh":
          "linear-gradient(135deg, rgba(5, 10, 26, 0.95) 0%, rgba(10, 22, 40, 0.98) 45%, rgba(0, 45, 61, 0.9) 100%)",
        "card-shine":
          "linear-gradient(120deg, transparent 30%, rgba(0, 212, 255, 0.08) 50%, transparent 70%)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        shimmer: "shimmer 2.5s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "holo-shine": "holo-shine 4s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { backgroundPosition: "200% 0" },
          "50%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px -4px rgba(0, 212, 255, 0.2)" },
          "50%": { boxShadow: "0 0 30px -2px rgba(0, 212, 255, 0.4)" },
        },
        "holo-shine": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [typography],
};
export default config;

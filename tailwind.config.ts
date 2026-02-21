import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#05070b",
        panel: "#0a0f17",
        line: "#1a2230",
        muted: "#8f9cb8",
        accent: "#8db6ff",
        accentStrong: "#6f9dff"
      },
      fontFamily: {
        display: ["var(--font-unbounded)"],
        sans: ["var(--font-manrope)"]
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.32)"
      }
    }
  },
  plugins: []
};

export default config;

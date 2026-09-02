/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--bg-app)",
        surface: "var(--bg-surface)",
        "surface-raised": "var(--bg-surface-raised)",
        "surface-hover": "var(--bg-surface-hover)",
        border: {
          subtle: "var(--border-subtle)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          inverse: "var(--text-inverse)",
        },
        bullish: {
          DEFAULT: "var(--bullish)",
          bg: "var(--bullish-bg)",
          border: "var(--bullish-border)",
        },
        bearish: {
          DEFAULT: "var(--bearish)",
          bg: "var(--bearish-bg)",
          border: "var(--bearish-border)",
        },
        neutral: {
          brand: "var(--neutral-brand)",
          bg: "var(--neutral-bg)",
          border: "var(--neutral-border)",
        },
        accent: {
          primary: "var(--accent-primary)",
          "primary-hover": "var(--accent-primary-hover)",
          secondary: "var(--accent-secondary)",
        },
      },
      fontFamily: {
        sans: ["Inter", "Fira Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["Fira Code", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
}

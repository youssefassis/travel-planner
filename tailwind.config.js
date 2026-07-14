/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],

  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "var(--card)",
          subtle: "var(--card-subtle)",
          muted: "var(--muted)",
        },
        brand: {
          primary: "var(--primary)",
          dark: "var(--primary-dark)",
          light: "var(--primary-light)",
          accent: "var(--accent)",
        },
      },
      spacing: {
        0: "var(--space-0)",
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
        14: "var(--space-14)",
        16: "var(--space-16)",
        20: "var(--space-20)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        brand: "var(--shadow-primary)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
      },
    },
  },
  plugins: [],
};

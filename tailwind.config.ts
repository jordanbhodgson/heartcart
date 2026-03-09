import type { Config } from "tailwindcss";

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
          50: "#fef9ec",
          100: "#fdf0c8",
          200: "#fbe08d",
          300: "#f8c84a",
          400: "#f6b121",
          500: "#ef9208",
          600: "#d36d04",
          700: "#af4d07",
          800: "#8e3c0e",
          900: "#75320f",
        },
        sage: {
          50: "#f2f7f2",
          100: "#e0ede0",
          200: "#c2dbc3",
          300: "#97c19a",
          400: "#68a16c",
          500: "#4a844e",
          600: "#39693d",
          700: "#2f5433",
          800: "#28432b",
          900: "#223825",
        },
      },
    },
  },
  plugins: [],
};

export default config;

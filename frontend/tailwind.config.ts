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
        primary: "#2C3E50",    // Defined Centers / Deep Navy
        text: "#1A1A1A",       // Text (Primary) / Near Black
        surface: "#F5F7FA",    // Open Centers / Light Blue-Gray
        secondary: "#8B95A5",  // Channel Lines / Steel Gray
        accent: "#3498DB",     // Gate Points / Bright Blue
        error: "#E74C3C",      // Error Messages / Alert Red
        success: "#27AE60",    // Success Messages / Success Green
        background: "#FFFFFF", // Page Background / Pure White
        card: "#F9FAFC",       // Card Backgrounds / Very Light Gray
        border: "#E8EAED",     // Borders / Light Divider
      },
    },
  },
  plugins: [],
};
export default config;

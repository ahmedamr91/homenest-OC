import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FAF6F0",
        sand: "#F0E9DF",
        linen: "#E7DDD1",
        ink: "#221B15",
        clay: {
          DEFAULT: "#B4552D",
          dark: "#96431F",
          light: "#E8C4B0",
        },
        moss: "#5B6650",
      },
      fontFamily: {
        display: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
        body: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(34,27,21,0.06), 0 8px 24px rgba(34,27,21,0.06)",
        lift: "0 4px 12px rgba(34,27,21,0.08), 0 16px 40px rgba(34,27,21,0.10)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;

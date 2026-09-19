import type { Config } from "tailwindcss";
import tailwindcssAnimated from "tailwindcss-animated";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          600: "#4F46E5",
          700: "#4338CA",
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', "sans-serif"],
        heading: ['"Geist Mono"', "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        ripple: "ripple 3400ms ease infinite",
      },
    },
  },
  plugins: [tailwindcssAnimated],
} satisfies Config;

import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        "sans": ["Pretendard", ...defaultTheme.fontFamily.sans],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "full",
            code: {
              color: "#eb5757",
              backgroundColor: "rgba(135, 131, 120, 0.15)",
              padding: "0.2em 0.4em",
              margin: "0 0.2rem",
              borderRadius: "0.275rem",
              fontFamily: "Pretendard",
              fontWeight: "400",
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            "pre code": {
              backgroundColor: "transparent",
              color: "inherit",
              padding: "0",
              fontWeight: "inherit",
            },
          },
        },
        invert: {
          css: {
            code: {
              color: "#ff7369",
            },
          },
        },
      },
      rotate: {
        "45": "45deg",
        "135": "135deg",
        "225": "225deg",
        "315": "315deg",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
}

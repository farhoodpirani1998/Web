/** @type {import('tailwindcss').Config} */
//
// Deliberately minimal for Sprint 1.1 (scaffold only). No design-system
// tokens, brand colors, or plugins are wired up yet — those belong to the
// CMS UI work planned for a later sprint, once real components exist to
// justify them.
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

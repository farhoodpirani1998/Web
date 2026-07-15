import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

export type ColorScheme = "light" | "dark";

/**
 * Read-only theme helper (§12, §13, §24). Reports the OS/browser color
 * scheme preference only — it does not toggle the `.dark` class or
 * write to the DOM.
 *
 * Per `tokens.css` (§24 "Theme Strategy"), dark-mode variables are
 * scaffolded but not a maintained second theme yet; this hook exists so
 * a future theme switcher has a ready-made, correct signal to start
 * from, without this Sprint making that product decision itself.
 */
export function useColorScheme(): ColorScheme {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  return prefersDark ? "dark" : "light";
}

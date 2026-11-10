import { useMediaQuery } from "@/shared/hooks/useMediaQuery";

export type ColorScheme = "light" | "dark";

/**
 * Read-only theme helper (§12, §13, §24). Reports the OS/browser color
 * scheme preference only — it does not toggle the `.dark` class or
 * write to the DOM.
 *
 * Dark mode is not applied or persisted by this hook.
 */
export function useColorScheme(): ColorScheme {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  return prefersDark ? "dark" : "light";
}

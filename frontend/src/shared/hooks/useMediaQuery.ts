import { useEffect, useState } from "react";

/**
 * Content-agnostic viewport/breakpoint helper.
 *
 * Belongs in the shared hooks area (Website Frontend Architecture §6)
 * because it is useful to more than one feature — promote helpers here
 * only once a second feature genuinely needs them (§6, §13 "rule of two").
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;

  const [matches, setMatches] = useState<boolean>(getMatch);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", listener);

    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

import { createContext, useContext } from "react";

interface GlobalSearchContextValue {
  openSearch: () => void;
}

export const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function useGlobalSearchContext(): GlobalSearchContextValue {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearchContext must be used within a GlobalSearchProvider");
  }
  return context;
}

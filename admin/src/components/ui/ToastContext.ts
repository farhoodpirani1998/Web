import { createContext, useContext } from "react";

export interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return context;
}

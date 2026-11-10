import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ToastContext, type ToastMessage } from "./ToastContext";

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...toast, id }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-start gap-2 sm:inset-x-auto sm:end-6 sm:w-96"
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => onDismiss(toast.id), 4500);
    return () => window.clearTimeout(timeoutId);
  }, [onDismiss, toast.id]);

  const Icon =
    toast.variant === "success"
      ? CheckCircle2
      : toast.variant === "error"
        ? AlertCircle
        : Info;
  const tone =
    toast.variant === "success"
      ? "text-success"
      : toast.variant === "error"
        ? "text-destructive"
        : "text-primary";

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      className="pointer-events-auto flex w-full items-start gap-3 rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl animate-fade-in"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tone}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {toast.description}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        aria-label="بستن پیام"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

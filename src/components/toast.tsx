"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; tone: ToastTone; message: string };

type ToastContext = {
  toast: (message: string, tone?: ToastTone) => void;
  confirm: (message: string) => Promise<boolean>;
};

const Ctx = createContext<ToastContext | null>(null);

export function useToast(): ToastContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<{
    message: string;
    resolve: (v: boolean) => void;
  } | null>(null);

  const toast = useCallback((message: string, tone: ToastTone = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, tone, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ message, resolve });
    });
  }, []);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto min-w-[260px] rounded-[var(--r-md)] border px-4 py-3 text-[13px] shadow-[0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-xl",
              t.tone === "success" &&
                "border-[rgba(16,185,129,0.3)] bg-[color:var(--success-soft)] text-[color:var(--success)]",
              t.tone === "error" &&
                "border-[rgba(239,68,68,0.3)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]",
              t.tone === "info" &&
                "border-[color:var(--border-strong)] bg-[color:var(--surface-glass-strong)] text-[color:var(--text)]"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onConfirm={() => {
            confirmState.resolve(true);
            setConfirmState(null);
          }}
          onCancel={() => {
            confirmState.resolve(false);
            setConfirmState(null);
          }}
        />
      )}
    </Ctx.Provider>
  );
}

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-[440px] max-w-[90vw] rounded-[var(--r-xl)] border border-[color:var(--border-strong)] bg-[color:var(--bg-2)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-subtle)]">
          Confirm action
        </div>
        <p className="mb-6 text-[14px] leading-relaxed text-[color:var(--text)]">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[var(--r-md)] border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 py-2 text-[13px] text-[color:var(--text)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-[var(--r-md)] px-4 py-2 text-[13px] font-medium text-white"
            style={{ background: "var(--danger)" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

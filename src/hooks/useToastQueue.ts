"use client";

import { useCallback, useState } from "react";

export interface QueuedToast {
  id: number;
  message: string;
  tone: "success" | "error";
}

/** Same toast pattern useShortcuts uses internally, extracted for reuse by other features (backup/restore) without touching that hook. */
export function useToastQueue() {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);

  const pushToast = useCallback((message: string, tone: QueuedToast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return { toasts, pushToast };
}

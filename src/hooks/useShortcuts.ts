"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import type { NewShortcut, ShortcutUpdate } from "@/domain/entities/shortcut";
import { deriveStatus } from "@/domain/entities/shortcut";
import { container } from "@/infrastructure/di/container";

interface Toast {
  id: number;
  message: string;
  tone: "success" | "error";
}

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState<ShortcutViewModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await container.listShortcuts.execute();
      setShortcuts(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your shortcuts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addShortcut = useCallback(
    async (input: NewShortcut) => {
      const tempId = `temp-${Date.now()}`;
      const optimistic: ShortcutViewModel = {
        id: tempId,
        name: input.name,
        url: input.url,
        category: input.category,
        owner: "",
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        status: deriveStatus(input),
      };
      setShortcuts((s) => [optimistic, ...s]);
      try {
        const created = await container.createShortcut.execute(input);
        setShortcuts((s) => s.map((sc) => (sc.id === tempId ? created : sc)));
        pushToast(`${created.name} added.`);
      } catch (e) {
        setShortcuts((s) => s.filter((sc) => sc.id !== tempId));
        pushToast(e instanceof Error ? e.message : "Couldn't add that shortcut.", "error");
        throw e;
      }
    },
    [pushToast]
  );

  const editShortcut = useCallback(
    async (id: string, input: ShortcutUpdate) => {
      const previous = shortcuts;
      setShortcuts((s) =>
        s.map((sc) => (sc.id === id ? { ...sc, ...input, status: deriveStatus({ url: input.url ?? sc.url }) } : sc))
      );
      try {
        const updated = await container.updateShortcut.execute(id, input);
        setShortcuts((s) => s.map((sc) => (sc.id === id ? updated : sc)));
        pushToast(`${updated.name} updated.`);
      } catch (e) {
        setShortcuts(previous);
        pushToast(e instanceof Error ? e.message : "Couldn't update that shortcut.", "error");
        throw e;
      }
    },
    [shortcuts, pushToast]
  );

  const removeShortcut = useCallback(
    async (id: string) => {
      const previous = shortcuts;
      const target = shortcuts.find((s) => s.id === id);
      setShortcuts((s) => s.filter((sc) => sc.id !== id));
      try {
        await container.deleteShortcut.execute(id);
        pushToast(`${target?.name ?? "Shortcut"} removed.`);
      } catch (e) {
        setShortcuts(previous);
        pushToast(e instanceof Error ? e.message : "Couldn't remove that shortcut.", "error");
        throw e;
      }
    },
    [shortcuts, pushToast]
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of shortcuts) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
    return counts;
  }, [shortcuts]);

  return {
    shortcuts,
    loading,
    error,
    toasts,
    refresh,
    addShortcut,
    editShortcut,
    removeShortcut,
    categoryCounts,
  };
}

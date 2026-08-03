"use client";

import { useCallback, useState } from "react";
import type { DuplicateStrategy, ImportPreview } from "@/application/dto/import-export-dto";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { validateImportRows } from "@/application/usecases/validate-import-rows";
import { container } from "@/infrastructure/di/container";
import { parseImportFile } from "@/infrastructure/io/import-parsers";

interface Progress {
  done: number;
  total: number;
}

export function useImport(
  existingShortcuts: ShortcutViewModel[],
  onImported: () => Promise<void> | void,
  pushToast: (message: string, tone?: "success" | "error") => void
) {
  const [parsing, setParsing] = useState(false);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<Progress>({ done: 0, total: 0 });

  const analyzeFile = useCallback(
    async (file: File) => {
      setParsing(true);
      setPreview(null);
      try {
        const rawRows = await parseImportFile(file);
        setPreview(validateImportRows(rawRows, existingShortcuts));
      } catch (err) {
        pushToast(err instanceof Error ? err.message : "Couldn't read that file.", "error");
      } finally {
        setParsing(false);
      }
    },
    [existingShortcuts, pushToast]
  );

  const confirmImport = useCallback(
    async (strategy: DuplicateStrategy) => {
      if (!preview) return;
      setImporting(true);
      try {
        const result = await container.importShortcuts.execute(preview.rows, strategy, (done, total) =>
          setProgress({ done, total })
        );
        if (result.imported > 0) pushToast(`${result.imported} shortcuts imported successfully.`);
        if (result.skipped > 0) pushToast(`${result.skipped} duplicate shortcuts skipped.`);
        if (result.failed > 0) pushToast(`${result.failed} rows failed to import.`, "error");
        setPreview(null);
        await onImported();
      } catch (err) {
        pushToast(err instanceof Error ? err.message : "Import failed — please try again.", "error");
      } finally {
        setImporting(false);
        setProgress({ done: 0, total: 0 });
      }
    },
    [preview, pushToast, onImported]
  );

  const reset = useCallback(() => setPreview(null), []);

  return { analyzeFile, preview, parsing, importing, progress, confirmImport, reset };
}

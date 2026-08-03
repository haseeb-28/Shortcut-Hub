"use client";

import { useState } from "react";
import type { ExportFormat } from "@/application/dto/import-export-dto";
import { prepareExportRows } from "@/application/usecases/prepare-export-data";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { exportAsCsv, exportAsJson, exportAsXlsx } from "@/infrastructure/io/export-formatters";
import { buildBackupFilename, triggerDownload } from "@/infrastructure/io/file-download";

const LAST_BACKUP_KEY = "shortcut-hub:last-backup-at";

export function useExport(shortcuts: ShortcutViewModel[], pushToast: (message: string, tone?: "success" | "error") => void) {
  const [exporting, setExporting] = useState(false);

  async function exportData(format: ExportFormat) {
    if (shortcuts.length === 0) {
      pushToast("Nothing to export yet — add a shortcut first.", "error");
      return;
    }
    setExporting(true);
    try {
      const rows = prepareExportRows(shortcuts);
      const blob =
        format === "json" ? exportAsJson(rows) : format === "csv" ? await exportAsCsv(rows) : await exportAsXlsx(rows);
      triggerDownload(blob, buildBackupFilename(format));
      localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
      pushToast(`Backup exported as ${format.toUpperCase()}.`);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : "Export failed — please try again.", "error");
    } finally {
      setExporting(false);
    }
  }

  return { exportData, exporting };
}

/** Reads the locally-stored "last backup" timestamp shown on the Settings page. */
export function getLastBackupAt(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_BACKUP_KEY);
}

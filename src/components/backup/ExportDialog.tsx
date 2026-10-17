"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, FileJson, FileSpreadsheet, FileText, Loader2, X } from "lucide-react";
import type { ExportFormat } from "@/application/dto/import-export-dto";

interface Props {
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
  exporting: boolean;
  total: number;
}

const FORMATS: { value: ExportFormat; label: string; description: string; icon: typeof FileJson }[] = [
  { value: "json", label: "JSON", description: "Full fidelity — best for re-importing later", icon: FileJson },
  { value: "csv", label: "CSV", description: "Opens in Excel, Sheets, Numbers", icon: FileText },
  { value: "xlsx", label: "Excel (.xlsx)", description: "Formatted workbook, ready to browse", icon: FileSpreadsheet },
];

export function ExportDialog({ open, onClose, onExport, exporting, total }: Props) {
  const [selected, setSelected] = useState<ExportFormat>("json");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={exporting ? undefined : onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl border border-border bg-ink-800 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold text-mist">Export Data</h2>
                <p className="mt-0.5 font-mono text-[11px] text-ink2">{total} shortcuts will be included</p>
              </div>
              <button
                onClick={onClose}
                disabled={exporting}
                aria-label="Close"
                className="rounded-md p-1 text-ink2 transition hover:bg-ink-600 hover:text-mist disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {FORMATS.map((format) => {
                const active = selected === format.value;
                return (
                  <button
                    key={format.value}
                    type="button"
                    onClick={() => setSelected(format.value)}
                    className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                      active ? "border-amber/60 bg-amber/10" : "border-border bg-ink-700/40 hover:border-ink-500"
                    }`}
                  >
                    <format.icon className={`h-5 w-5 shrink-0 ${active ? "text-amber" : "text-ink2"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-medium text-mist">{format.label}</span>
                      <span className="block truncate font-mono text-[10px] text-ink2">{format.description}</span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-amber" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={exporting}
                className="rounded-lg px-4 py-2 font-display text-sm text-ink2 transition hover:text-mist disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onExport(selected)}
                disabled={exporting}
                className="flex min-w-[104px] items-center justify-center gap-2 rounded-lg bg-amber px-4 py-2 font-display text-sm font-semibold text-button transition hover:bg-amber-soft disabled:opacity-70"
              >
                {exporting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {exporting ? "Exporting…" : "Export"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

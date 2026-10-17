"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Copy, Loader2, X } from "lucide-react";
import type { DuplicateStrategy, ImportPreview } from "@/application/dto/import-export-dto";
import { DropZone } from "./DropZone";
import { ImportPreviewTable } from "./ImportPreviewTable";

interface Props {
  open: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  parsing: boolean;
  preview: ImportPreview | null;
  importing: boolean;
  progress: { done: number; total: number };
  onConfirm: (strategy: DuplicateStrategy) => Promise<void>;
  onReset: () => void;
}

const STRATEGIES: { value: DuplicateStrategy; label: string; description: string }[] = [
  { value: "skip", label: "Skip duplicates", description: "Only add shortcuts that aren't already saved" },
  { value: "replace", label: "Replace existing", description: "Overwrite the saved shortcut with the imported one" },
  { value: "keep-both", label: "Keep both", description: "Import duplicates as new, separate shortcuts" },
];

export function ImportDialog({
  open,
  onClose,
  onFileSelected,
  parsing,
  preview,
  importing,
  progress,
  onConfirm,
  onReset,
}: Props) {
  const [strategy, setStrategy] = useState<DuplicateStrategy>("skip");

  function handleClose() {
    if (importing) return;
    onReset();
    onClose();
  }

  const actionableCount = preview ? preview.validCount + (strategy === "skip" ? 0 : preview.duplicateCount) : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl border border-border bg-ink-800 p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-mist">Import Data</h2>
              <button
                onClick={handleClose}
                disabled={importing}
                aria-label="Close"
                className="rounded-md p-1 text-ink2 transition hover:bg-ink-600 hover:text-mist disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {importing ? (
              <ImportProgressView progress={progress} />
            ) : preview ? (
              <PreviewAndConfirm
                preview={preview}
                strategy={strategy}
                onStrategyChange={setStrategy}
                actionableCount={actionableCount}
                onBack={onReset}
                onConfirm={() => onConfirm(strategy)}
              />
            ) : (
              <DropZone onFile={onFileSelected} disabled={parsing} />
            )}

            {parsing && (
              <p className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-ink2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading file…
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PreviewAndConfirm({
  preview,
  strategy,
  onStrategyChange,
  actionableCount,
  onBack,
  onConfirm,
}: {
  preview: ImportPreview;
  strategy: DuplicateStrategy;
  onStrategyChange: (s: DuplicateStrategy) => void;
  actionableCount: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-2 text-center">
        <StatChip label="Total" value={preview.total} />
        <StatChip label="Valid" value={preview.validCount} tone="text-teal" />
        <StatChip label="Duplicates" value={preview.duplicateCount} tone="text-amber" />
        <StatChip label="Invalid" value={preview.invalidCount} tone="text-danger" />
      </div>

      <ImportPreviewTable rows={preview.rows} />

      {preview.duplicateCount > 0 && (
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-ink2">
            <Copy className="h-3.5 w-3.5" /> Duplicate handling
          </p>
          <div className="flex flex-col gap-1.5">
            {STRATEGIES.map((s) => (
              <label
                key={s.value}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition ${
                  strategy === s.value ? "border-amber/60 bg-amber/10" : "border-border bg-ink-700/40 hover:border-ink-500"
                }`}
              >
                <input
                  type="radio"
                  name="duplicate-strategy"
                  checked={strategy === s.value}
                  onChange={() => onStrategyChange(s.value)}
                  className="mt-0.5 accent-amber"
                />
                <span>
                  <span className="block font-body text-xs font-medium text-mist">{s.label}</span>
                  <span className="block font-mono text-[10px] text-ink2">{s.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {preview.invalidCount > 0 && (
        <p className="flex items-center gap-1.5 font-body text-xs text-ink2">
          <AlertTriangle className="h-3.5 w-3.5 text-danger" />
          {preview.invalidCount} row{preview.invalidCount === 1 ? "" : "s"} will be skipped — hover a row's status
          badge for the reason.
        </p>
      )}

      <div className="mt-1 flex items-center justify-between border-t border-border pt-4">
        <button onClick={onBack} className="font-display text-sm text-ink2 transition hover:text-mist">
          Choose a different file
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-ink2">
            Import {actionableCount} shortcut{actionableCount === 1 ? "" : "s"}?
          </span>
          <button
            onClick={onConfirm}
            disabled={actionableCount === 0}
            className="rounded-lg bg-amber px-4 py-2 font-display text-sm font-semibold text-button transition hover:bg-amber-soft disabled:opacity-50"
          >
            Import
          </button>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border border-border bg-ink-700/40 py-2">
      <p className={`font-display text-lg font-semibold ${tone ?? "text-mist"}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-wide text-ink2">{label}</p>
    </div>
  );
}

function ImportProgressView({ progress }: { progress: { done: number; total: number } }) {
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  const complete = progress.total > 0 && progress.done >= progress.total;

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      {complete ? (
        <CheckCircle2 className="h-9 w-9 text-teal" />
      ) : (
        <Loader2 className="h-9 w-9 animate-spin text-amber" />
      )}
      <div>
        <p className="font-display text-sm font-semibold text-mist">
          {complete ? "Wrapping up…" : "Importing…"}
        </p>
        <p className="mt-1 font-mono text-xs text-ink2">
          {progress.done} / {progress.total}
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-600">
        <motion.div
          className="h-full rounded-full bg-amber"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

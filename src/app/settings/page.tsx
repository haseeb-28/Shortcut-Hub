"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, ShieldAlert, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useShortcuts } from "@/hooks/useShortcuts";
import { useExport, getLastBackupAt } from "@/hooks/useExport";
import { useImport } from "@/hooks/useImport";
import { useToastQueue } from "@/hooks/useToastQueue";
import { timeAgo } from "@/lib/utils";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ToastStack } from "@/components/ToastStack";
import { ExportDialog } from "@/components/backup/ExportDialog";
import { ImportDialog } from "@/components/backup/ImportDialog";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthed, ready, logout } = useAuth();
  const { shortcuts, refresh } = useShortcuts();
  const { toasts, pushToast } = useToastQueue();

  const { exportData, exporting } = useExport(shortcuts, pushToast);
  const { analyzeFile, preview, parsing, importing, progress, confirmImport, reset } = useImport(
    shortcuts,
    refresh,
    pushToast
  );

  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !isAuthed) router.replace("/login");
  }, [ready, isAuthed, router]);

  // Read once on mount — window/localStorage aren't available during SSR.
  useEffect(() => {
    setLastBackup(getLastBackupAt());
  }, [exportOpen]);

  if (!ready || !isAuthed) return null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <NavBar onLogout={logout} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-mist">Settings</h2>
          <p className="mt-1 font-mono text-[11px] text-ink2">Manage your data</p>
        </div>

        <section className="rounded-xl border border-border bg-ink-700/40 p-5 shadow-card sm:p-6">
          <h3 className="font-display text-base font-semibold text-mist">Backup & Restore</h3>
          <p className="mt-1 max-w-xl font-body text-sm text-ink2">
            Appwrite Cloud's free tier doesn't include automatic backups, so this app handles it
            instead — export your shortcuts any time, and import them back (here or into a fresh
            account) whenever you need to.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setExportOpen(true)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-ink-700/50 p-4 text-left transition hover:border-amber/50 hover:bg-ink-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber transition group-hover:bg-amber group-hover:text-ink-900">
                <Download className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-mist">Export Data</span>
                <span className="block font-mono text-[11px] text-ink2">JSON, CSV, or Excel</span>
              </span>
            </button>

            <button
              onClick={() => setImportOpen(true)}
              className="group flex items-center gap-3 rounded-lg border border-border bg-ink-700/50 p-4 text-left transition hover:border-teal/50 hover:bg-ink-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal transition group-hover:bg-teal group-hover:text-ink-900">
                <Upload className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-mist">Import Data</span>
                <span className="block font-mono text-[11px] text-ink2">Restore from a backup file</span>
              </span>
            </button>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
            <span className="font-mono text-[11px] text-ink2">Last backup</span>
            <span className="font-mono text-[11px] text-mist">{lastBackup ? timeAgo(lastBackup) : "Never"}</span>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber/20 bg-amber/5 p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
            <p className="font-body text-xs text-ink2">
              <span className="text-mist">Recommended:</span> export your data regularly. Appwrite's
              free tier doesn't back this up for you.
            </p>
          </div>
        </section>
      </motion.div>

      <ExportDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={async (format) => {
          await exportData(format);
          setExportOpen(false);
        }}
        exporting={exporting}
        total={shortcuts.length}
      />

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onFileSelected={analyzeFile}
        parsing={parsing}
        preview={preview}
        importing={importing}
        progress={progress}
        onConfirm={async (strategy) => {
          await confirmImport(strategy);
          setImportOpen(false);
        }}
        onReset={reset}
      />

      <Footer />
      <ToastStack toasts={toasts} />
    </main>
  );
}

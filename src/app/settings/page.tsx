"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, LogOut, Moon, ShieldAlert, Sun, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
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
import { beginNavigation } from "@/lib/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthed, ready, logout, user } = useAuth();
  const { theme, setTheme } = useTheme();
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
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (ready && !isAuthed) {
      beginNavigation();
      router.replace(user ? "/verification-pending" : "/login");
    }
  }, [ready, isAuthed, user, router]);

  // Read once on mount — window/localStorage aren't available during SSR.
  useEffect(() => {
    setLastBackup(getLastBackupAt());
  }, [exportOpen]);

  if (!ready || !isAuthed) return null;

  async function confirmSignOut() {
    setSigningOut(true);
    setSignOutError(null);
    try {
      await logout();
      setSignOutOpen(false);
      beginNavigation();
      router.replace("/login");
    } catch (error) {
      setSignOutError(
        error instanceof Error ? error.message : "Unable to sign out. Please try again."
      );
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <NavBar />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-6">
          <h2 className="font-display text-xl font-semibold text-mist">Settings</h2>
          <p className="mt-1 font-mono text-[11px] text-ink2">Manage your data</p>
        </div>

        <section className="neu-surface mb-4 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="font-display text-base font-semibold text-mist">Appearance</h3>
            <p className="mt-1 font-body text-sm text-ink2">
              Choose a theme for Shortcut Hub. New users follow their device preference.
            </p>
          </div>
          <div className="neu-inset flex shrink-0 gap-1 rounded-xl border p-1" role="group" aria-label="Color theme">
            <button
              type="button"
              aria-pressed={theme === "light"}
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs transition ${
                theme === "light" ? "bg-amber text-button" : "text-ink2 hover:text-mist"
              }`}
            >
              <Sun className="h-4 w-4" />
              Light
            </button>
            <button
              type="button"
              aria-pressed={theme === "dark"}
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs transition ${
                theme === "dark" ? "bg-amber text-button" : "text-ink2 hover:text-mist"
              }`}
            >
              <Moon className="h-4 w-4" />
              Dark
            </button>
          </div>
        </section>

        <section className="neu-surface rounded-2xl border p-5 sm:p-6">
          <h3 className="font-display text-base font-semibold text-mist">Backup & Restore</h3>
          <p className="mt-1 max-w-xl font-body text-sm text-ink2">
            Appwrite Cloud's free tier doesn't include automatic backups, so this app handles it
            instead — export your shortcuts any time, and import them back (here or into a fresh
            account) whenever you need to.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => setExportOpen(true)}
              className="neu-button group flex items-center gap-3 rounded-xl border border-border bg-ink-800 p-4 text-left transition hover:border-amber/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber/15 text-amber transition group-hover:bg-amber group-hover:text-button">
                <Download className="h-4.5 w-4.5" />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-mist">Export Data</span>
                <span className="block font-mono text-[11px] text-ink2">JSON, CSV, or Excel</span>
              </span>
            </button>

            <button
              onClick={() => setImportOpen(true)}
              className="neu-button group flex items-center gap-3 rounded-xl border border-border bg-ink-800 p-4 text-left transition hover:border-teal/50"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal transition group-hover:bg-teal group-hover:text-button">
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

        <section className="neu-surface mt-4 flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h3 className="font-display text-base font-semibold text-mist">Sign out</h3>
            <p className="mt-1 font-body text-sm text-ink2">
              Sign out of your Shortcut Hub account on this device.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSignOutError(null);
              setSignOutOpen(true);
            }}
            className="neu-button inline-flex items-center justify-center gap-2 rounded-lg border border-danger/40 bg-ink-800 px-4 py-2.5 font-display text-sm font-semibold text-danger transition hover:bg-danger/10"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>
      </motion.div>

      {signOutOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink-900/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !signingOut) {
              setSignOutOpen(false);
            }
          }}
        >
          <motion.section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="sign-out-title"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="neu-surface w-full max-w-sm rounded-2xl border p-6"
          >
            <h3 id="sign-out-title" className="font-display text-lg font-semibold text-mist">
              Sign out?
            </h3>
            <p className="mt-2 font-body text-sm text-ink2">
              Are you sure you want to sign out of Shortcut Hub?
            </p>
            {signOutError && (
              <p role="alert" className="mt-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {signOutError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={signingOut}
                onClick={() => setSignOutOpen(false)}
                className="rounded-lg px-4 py-2 font-display text-sm text-ink2 transition hover:text-mist disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={signingOut}
                onClick={confirmSignOut}
                className="neu-button rounded-lg bg-danger px-4 py-2 font-display text-sm font-semibold text-button transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}

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

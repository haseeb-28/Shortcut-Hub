"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import type {
  Category,
  NewShortcut,
} from "@/domain/entities/shortcut";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";

import { useAuth } from "@/hooks/useAuth";
import { useShortcuts } from "@/hooks/useShortcuts";

import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { DashboardStats } from "@/components/DashboardStats";
import { CategoryChips } from "@/components/CategoryChips";
import { StatsBar } from "@/components/StatsBar";
import { ShortcutGrid } from "@/components/ShortcutGrid";
import { AddEditModal } from "@/components/AddEditModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { ShortcutPreviewModal } from "@/components/ShortcutPreviewModal";
import { ToastStack } from "@/components/ToastStack";
import { beginNavigation } from "@/lib/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const { isAuthed, ready, user } = useAuth();

  const {
    shortcuts,
    loading,
    error,
    toasts,
    addShortcut,
    editShortcut,
    removeShortcut,
    categoryCounts,
  } = useShortcuts();

  // ------------------------------------------------------------
  // Search
  // ------------------------------------------------------------

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  // ------------------------------------------------------------
  // Category filter
  // ------------------------------------------------------------

  const [activeCategory, setActiveCategory] =
    useState<Category | "All">("All");

  // ------------------------------------------------------------
  // Add / Edit modal
  // ------------------------------------------------------------

  const [modalOpen, setModalOpen] = useState(false);

  const [editingShortcut, setEditingShortcut] =
    useState<ShortcutViewModel | null>(null);

  // ------------------------------------------------------------
  // Preview modal
  // ------------------------------------------------------------

  const [previewTarget, setPreviewTarget] =
    useState<ShortcutViewModel | null>(null);

  // ------------------------------------------------------------
  // Delete modal
  // ------------------------------------------------------------

  const [deleteTarget, setDeleteTarget] =
    useState<ShortcutViewModel | null>(null);

  // ------------------------------------------------------------
  // Authentication redirect
  // ------------------------------------------------------------

  useEffect(() => {
    if (ready && !isAuthed) {
      beginNavigation();
      router.replace(user ? "/verification-pending" : "/login");
    }
  }, [ready, isAuthed, user, router]);

  // ------------------------------------------------------------
  // Filter shortcuts
  // ------------------------------------------------------------

  const filtered = useMemo<ShortcutViewModel[]>(() => {
    const q = deferredQuery.trim().toLowerCase();

    return shortcuts.filter((shortcut) => {
      const matchesCategory =
        activeCategory === "All" ||
        shortcut.category === activeCategory;

      const matchesQuery =
        !q ||
        shortcut.name.toLowerCase().includes(q) ||
        shortcut.category.toLowerCase().includes(q) ||
        shortcut.url.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [shortcuts, deferredQuery, activeCategory]);

  // ------------------------------------------------------------
  // Statistics
  // ------------------------------------------------------------

  const available = shortcuts.filter(
    (shortcut) => shortcut.status === "Available"
  ).length;

  const missing = shortcuts.length - available;

  // ------------------------------------------------------------
  // Open Add modal
  // ------------------------------------------------------------

  function openAddModal() {
    setPreviewTarget(null);
    setEditingShortcut(null);
    setModalOpen(true);
  }

  // ------------------------------------------------------------
  // Open Edit modal
  // ------------------------------------------------------------

  function openEditModal(shortcut: ShortcutViewModel) {
    setPreviewTarget(null);
    setEditingShortcut(shortcut);
    setModalOpen(true);
  }

  // ------------------------------------------------------------
  // Open Preview modal
  // ------------------------------------------------------------

  function openPreviewModal(shortcut: ShortcutViewModel) {
    setPreviewTarget(shortcut);
  }

  // ------------------------------------------------------------
  // Open first search result
  // ------------------------------------------------------------

  function openFirstResult() {
    const first = filtered[0];

    if (!first) {
      return;
    }

    window.open(
      first.url,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ------------------------------------------------------------
  // Add or update shortcut
  // ------------------------------------------------------------

  async function handleSubmit(input: NewShortcut) {
    if (editingShortcut) {
      await editShortcut(editingShortcut.id, input);
    } else {
      await addShortcut(input);
    }

    setModalOpen(false);
    setEditingShortcut(null);
  }

  // ------------------------------------------------------------
  // Wait for authentication
  // ------------------------------------------------------------

  if (!ready || !isAuthed) {
    return null;
  }

  return (
    <>
      <main className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <NavBar
          search={{
            value: query,
            onChange: setQuery,
            total: shortcuts.length,
            onEnter: openFirstResult,
          }}
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Dashboard statistics */}
          <DashboardStats
            shortcuts={shortcuts}
            loading={loading}
          />

          {/* Categories and stats */}
          <section className="mb-6 flex flex-col gap-4">
            <CategoryChips
              active={activeCategory}
              onSelect={setActiveCategory}
              counts={categoryCounts}
              total={shortcuts.length}
            />

            <StatsBar
              total={shortcuts.length}
              available={available}
              missing={missing}
              visibleCount={filtered.length}
            />
          </section>

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger">
              {error}
            </div>
          )}

          {/* Shortcut content */}
          {loading ? (
            <LoadingGrid />
          ) : (
            <ShortcutGrid
              shortcuts={filtered}
              hasAnyShortcuts={shortcuts.length > 0}
              onEdit={openEditModal}
              onDelete={setDeleteTarget}
              onPreview={openPreviewModal}
              onAdd={openAddModal}
              query={deferredQuery}
            />
          )}
        </motion.div>

        {/* Add / Edit modal */}
        <AddEditModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditingShortcut(null);
          }}
          onSubmit={handleSubmit}
          editing={editingShortcut}
        />

        {/* Shortcut preview modal */}
        <ShortcutPreviewModal
          shortcut={previewTarget}
          onClose={() => setPreviewTarget(null)}
          onEdit={openEditModal}
          onDelete={(shortcut) => {
            setPreviewTarget(null);
            setDeleteTarget(shortcut);
          }}
        />

        {/* Delete confirmation */}
        <ConfirmDeleteModal
          target={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget) {
              await removeShortcut(deleteTarget.id);
            }

            setDeleteTarget(null);
          }}
        />

        <Footer />

        <ToastStack toasts={toasts} />
      </main>
      <motion.button
        type="button"
        onClick={openAddModal}
        whileHover={{ y: -3, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        aria-label="Add shortcut"
        className="neu-button fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2.5 rounded-2xl border border-amber/40 bg-amber px-5 py-3.5 font-display text-sm font-semibold text-button shadow-[7px_7px_16px_var(--shadow-dark),-5px_-5px_14px_var(--raised-highlight)] transition-colors hover:bg-amber-soft focus-visible:outline-none sm:bottom-8 sm:right-8 sm:px-6 sm:py-4"
      >
        <Plus className="h-5 w-5" strokeWidth={2.5} aria-hidden="true" />
        Add shortcut
      </motion.button>
    </>
  );
}

// ------------------------------------------------------------
// Loading skeleton
// ------------------------------------------------------------

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.25,
            delay: index * 0.04,
          }}
          className="neu-surface h-40 animate-pulse rounded-xl border"
        />
      ))}
    </div>
  );
}
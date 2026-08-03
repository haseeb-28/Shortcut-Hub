"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Category } from "@/domain/entities/shortcut";
import type { NewShortcut } from "@/domain/entities/shortcut";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { useAuth } from "@/hooks/useAuth";
import { useShortcuts } from "@/hooks/useShortcuts";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { DashboardStats } from "@/components/DashboardStats";
import { CommandBar } from "@/components/CommandBar";
import { CategoryChips } from "@/components/CategoryChips";
import { StatsBar } from "@/components/StatsBar";
import { ShortcutGrid } from "@/components/ShortcutGrid";
import { AddEditModal } from "@/components/AddEditModal";
import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { ToastStack } from "@/components/ToastStack";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthed, ready, logout } = useAuth();
  const { shortcuts, loading, error, toasts, addShortcut, editShortcut, removeShortcut, categoryCounts } =
    useShortcuts();

  const [query, setQuery] = useState("");
  // Keeps the search input itself instant even while the (cheap, but
  // non-zero) filter + re-render of the grid trails a frame behind on
  // large lists — React schedules the deferred re-render at low priority.
  const deferredQuery = useDeferredValue(query);
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<ShortcutViewModel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShortcutViewModel | null>(null);

  useEffect(() => {
    if (ready && !isAuthed) router.replace("/login");
  }, [ready, isAuthed, router]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return shortcuts.filter((s) => {
      const matchesCategory = activeCategory === "All" || s.category === activeCategory;
      const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [shortcuts, deferredQuery, activeCategory]);

  const available = shortcuts.filter((s) => s.status === "Available").length;
  const missing = shortcuts.length - available;

  function openAddModal() {
    setEditingShortcut(null);
    setModalOpen(true);
  }

  function openEditModal(shortcut: ShortcutViewModel) {
    setEditingShortcut(shortcut);
    setModalOpen(true);
  }

  function openFirstResult() {
    if (filtered[0]) window.open(filtered[0].url, "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(input: NewShortcut) {
    if (editingShortcut) {
      await editShortcut(editingShortcut.id, input);
    } else {
      await addShortcut(input);
    }
  }

  if (!ready || !isAuthed) return null;

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <NavBar onLogout={logout} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <DashboardStats shortcuts={shortcuts} loading={loading} onAdd={openAddModal} />

        <section className="mb-6 flex flex-col gap-4">
          <CommandBar value={query} onChange={setQuery} onAdd={openAddModal} total={shortcuts.length} onEnter={openFirstResult} />
          <CategoryChips
            active={activeCategory}
            onSelect={setActiveCategory}
            counts={categoryCounts}
            total={shortcuts.length}
          />
          <StatsBar total={shortcuts.length} available={available} missing={missing} visibleCount={filtered.length} />
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 font-body text-sm text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <LoadingGrid />
        ) : (
          <ShortcutGrid
            shortcuts={filtered}
            hasAnyShortcuts={shortcuts.length > 0}
            onEdit={openEditModal}
            onDelete={setDeleteTarget}
            onAdd={openAddModal}
            query={deferredQuery}
          />
        )}
      </motion.div>

      <AddEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        editing={editingShortcut}
      />
      <ConfirmDeleteModal
        target={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) await removeShortcut(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
      <Footer />
      <ToastStack toasts={toasts} />
    </main>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-[104px] animate-pulse rounded-xl border border-border bg-ink-700/40" />
      ))}
    </div>
  );
}

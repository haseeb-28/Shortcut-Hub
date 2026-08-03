"use client";

import { motion } from "framer-motion";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";
import { CATEGORY_STYLE, cn, faviconFor } from "@/lib/utils";

interface Props {
  shortcut: ShortcutViewModel;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
  /** Current search term, used to highlight the matching substring in the name. */
  query?: string;
}

export function ShortcutCard({ shortcut, onEdit, onDelete, index, query }: Props) {
  const style = CATEGORY_STYLE[shortcut.category];
  const favicon = faviconFor(shortcut.url);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-ink-700/50 p-4 shadow-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-ink-500 hover:bg-ink-700/70 hover:shadow-glow"
    >
      {/* soft category-tinted glow that fades in on hover — glassmorphism accent */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
        style={{ backgroundColor: style.accent }}
        aria-hidden
      />
      <span
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ backgroundColor: style.accent }}
        aria-hidden
      />

      <div className="flex items-start justify-between gap-2 pl-1.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-ink-600">
            {favicon ? (
              // Small remote favicon; decorative, so alt is empty.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={favicon} alt="" className="h-5 w-5" loading="lazy" />
            ) : (
              <span className="font-display text-xs text-ink2">{shortcut.name.slice(0, 1)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-semibold text-mist">
              {highlightMatch(shortcut.name, query)}
            </h3>
            <p className="truncate font-mono text-[11px] text-ink2">{stripProtocol(shortcut.url)}</p>
          </div>
        </div>

        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]",
            shortcut.status === "Available" ? "text-teal" : "text-danger"
          )}
          style={{
            backgroundColor: shortcut.status === "Available" ? "rgba(79,209,197,0.12)" : "rgba(242,85,90,0.12)",
          }}
        >
          {shortcut.status}
        </span>
      </div>

      <div className="flex items-center justify-between pl-1.5">
        <span
          className="rounded-md px-2 py-1 font-mono text-[10px]"
          style={{ backgroundColor: style.bg, color: style.text }}
        >
          {shortcut.category}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            aria-label={`Edit ${shortcut.name}`}
            className="rounded-md p-1.5 text-ink2 opacity-0 transition hover:bg-ink-600 hover:text-mist group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            aria-label={`Remove ${shortcut.name}`}
            className="rounded-md p-1.5 text-ink2 opacity-0 transition hover:bg-danger/20 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <a
            href={shortcut.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${shortcut.name}`}
            className="rounded-md bg-ink-600 p-1.5 text-mist transition hover:bg-amber hover:text-ink-900"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function stripProtocol(url: string) {
  return url.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wraps the portion of `text` matching `query` in a highlighted <mark>. */
function highlightMatch(text: string, query?: string) {
  const trimmed = query?.trim();
  if (!trimmed) return text;

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, "gi"));
  if (parts.length === 1) return text;

  return parts.map((part, i) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={i} className="rounded-sm bg-amber/25 text-amber-soft">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

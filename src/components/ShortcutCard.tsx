"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

import type { ShortcutViewModel } from "@/application/dto/shortcut-dto";

import {
  cn,
  faviconFor,
  getCategoryStyle,
} from "@/lib/utils";

interface Props {
  shortcut: ShortcutViewModel;
  onEdit: (shortcut: ShortcutViewModel) => void;
  onDelete: (shortcut: ShortcutViewModel) => void;
  onPreview: (shortcut: ShortcutViewModel) => void;
  index: number;
  query?: string;
}

export function ShortcutCard({
  shortcut,
  onEdit,
  onDelete,
  onPreview,
  index,
  query,
}: Props) {
  const style = getCategoryStyle(shortcut.category);
  const favicon = faviconFor(shortcut.url);

  const [isHovered, setIsHovered] = useState(false);

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  function handleMouseMove(
    event: React.MouseEvent<HTMLDivElement>
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      ((event.clientX - rect.left) / rect.width - 0.5) * 2;

    const y =
      ((event.clientY - rect.top) / rect.height - 0.5) * 2;

    setMousePosition({
      x,
      y,
    });
  }

  function handleMouseLeave() {
    setIsHovered(false);

    setMousePosition({
      x: 0,
      y: 0,
    });
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>
  ) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onPreview(shortcut);
    }
  }

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 18,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -8,
        scale: 0.98,
        transition: {
          duration: 0.15,
        },
      }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.035, 0.35),
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onPreview(shortcut)}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Preview ${shortcut.name}`}
      style={{
        perspective: "1000px",
      }}
      className="group relative cursor-pointer outline-none"
    >
      {/* 3D card */}
      <motion.div
        animate={{
          rotateX: isHovered
            ? -mousePosition.y * 4
            : 0,
          rotateY: isHovered
            ? mousePosition.x * 5
            : 0,
          y: isHovered ? -6 : 0,
          scale: isHovered ? 1.015 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 22,
          mass: 0.7,
        }}
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
        }}
        className={cn(
          "relative flex min-h-[158px] flex-col gap-3",
          "overflow-hidden rounded-2xl",
          "neu-surface border",
          "p-4",
          "backdrop-blur-sm",
          "transition-colors duration-300",
          "focus-within:border-amber/50",
          isHovered ? "border-ink-500" : ""
        )}
      >
        {/* Category glow */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.32 : 0,
            scale: isHovered ? 1.15 : 0.85,
          }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
          }}
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl"
          style={{
            backgroundColor: style.accent,
          }}
          aria-hidden="true"
        />

        {/* Bottom ambient glow */}
        <motion.div
          animate={{
            opacity: isHovered ? 0.12 : 0,
          }}
          transition={{
            duration: 0.4,
          }}
          className="pointer-events-none absolute -bottom-16 left-1/2 h-28 w-40 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            backgroundColor: style.accent,
          }}
          aria-hidden="true"
        />

        {/* Category accent line */}
        <motion.span
          animate={{
            width: isHovered ? 5 : 3,
            opacity: isHovered ? 1 : 0.85,
          }}
          transition={{
            duration: 0.25,
          }}
          className="absolute inset-y-0 left-0 rounded-r-full"
          style={{
            backgroundColor: style.accent,
            boxShadow: isHovered
              ? `0 0 14px ${style.accent}`
              : "none",
          }}
          aria-hidden="true"
        />

        {/* Subtle shine */}
        <motion.div
          initial={{
            x: "-120%",
            opacity: 0,
          }}
          animate={
            isHovered
              ? {
                  x: "120%",
                  opacity: [0, 0.12, 0],
                }
              : {
                  x: "-120%",
                  opacity: 0,
                }
          }
          transition={{
            duration: 0.75,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-y-0 w-20 -skew-x-12 bg-white/10 blur-md"
          aria-hidden="true"
        />

        {/* Main content */}
        <div className="relative z-10 flex items-start justify-between gap-2 pl-1.5">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* Favicon container */}
            <motion.div
              animate={{
                rotateX: isHovered ? 4 : 0,
                rotateY: isHovered ? -4 : 0,
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              style={{
                transformStyle: "preserve-3d",
              }}
              className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-ink-600 shadow-inner"
            >
              {/* Favicon glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{
                  background: `radial-gradient(circle at center, ${style.accent}, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              {favicon ? (
                <img
                  src={favicon}
                  alt=""
                  className="relative z-10 h-5 w-5 object-contain"
                  loading="lazy"
                />
              ) : (
                <span
                  className="relative z-10 font-display text-xs font-semibold"
                  style={{
                    color: style.accent,
                  }}
                >
                  {shortcut.name
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
              )}
            </motion.div>

            {/* Name and URL */}
            <div className="min-w-0">
              <h3 className="truncate font-display text-sm font-semibold text-mist">
                {highlightMatch(
                  shortcut.name,
                  query
                )}
              </h3>

              <p className="mt-0.5 truncate font-mono text-[11px] text-ink2">
                {stripProtocol(shortcut.url)}
              </p>
            </div>
          </div>

          {/* Availability */}
          <motion.span
            animate={{
              scale: isHovered ? 1.04 : 1,
            }}
            transition={{
              duration: 0.2,
            }}
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]",
              shortcut.status === "Available"
                ? "text-teal"
                : "text-danger"
            )}
            style={{
              backgroundColor:
                shortcut.status === "Available"
                  ? "color-mix(in srgb, var(--teal) 12%, transparent)"
                  : "color-mix(in srgb, var(--danger) 12%, transparent)",
            }}
          >
            {shortcut.status}
          </motion.span>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 mt-auto flex items-center justify-between pl-1.5">
          {/* Category */}
          <motion.span
            animate={{
              y: isHovered ? -1 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
            className="rounded-md px-2 py-1 font-mono text-[10px]"
            style={{
              backgroundColor: style.bg,
              color: style.text,
            }}
          >
            {shortcut.category}
          </motion.span>

          {/* Actions */}
          <div className="shortcut-card-actions flex items-center gap-1">
            {/* Edit */}
            <motion.button
              whileHover={{
                scale: 1.08,
                y: -1,
              }}
              whileTap={{
                scale: 0.94,
              }}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(shortcut);
              }}
              aria-label={`Edit ${shortcut.name}`}
              className="rounded-md p-1.5 text-ink2 opacity-0 transition-colors hover:bg-ink-600 hover:text-mist group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Pencil className="h-3.5 w-3.5" />
            </motion.button>

            {/* Delete */}
            <motion.button
              whileHover={{
                scale: 1.08,
                y: -1,
              }}
              whileTap={{
                scale: 0.94,
              }}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(shortcut);
              }}
              aria-label={`Remove ${shortcut.name}`}
              className="rounded-md p-1.5 text-ink2 opacity-0 transition-colors hover:bg-danger/20 hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </motion.button>

            {/* External link */}
            <motion.a
              whileHover={{
                scale: 1.08,
                y: -1,
              }}
              whileTap={{
                scale: 0.94,
              }}
              href={shortcut.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${shortcut.name}`}
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="rounded-md bg-ink-600 p-1.5 text-mist transition-colors hover:bg-amber hover:text-button"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </motion.a>
          </div>
        </div>

        {/* 3D edge highlight */}
        <motion.div
          animate={{
            opacity: isHovered ? 1 : 0,
          }}
          transition={{
            duration: 0.25,
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `inset 0 0 0 1px ${style.accent}35`,
          }}
          aria-hidden="true"
        />
      </motion.div>
    </motion.div>
  );
}

function stripProtocol(url: string) {
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "");
}

function escapeRegExp(value: string) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function highlightMatch(
  text: string,
  query?: string
) {
  const trimmed = query?.trim();

  if (!trimmed) {
    return text;
  }

  const parts = text.split(
    new RegExp(
      `(${escapeRegExp(trimmed)})`,
      "gi"
    )
  );

  if (parts.length === 1) {
    return text;
  }

  return parts.map((part, index) =>
    part.toLowerCase() ===
    trimmed.toLowerCase() ? (
      <mark
        key={index}
        className="rounded bg-amber/20 px-0.5 text-amber"
      >
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}
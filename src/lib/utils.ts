import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Style definition for category badges, chips, charts and cards.
 */
export interface CategoryStyle {
  accent: string;
  bg: string;
  text: string;
}

/**
 * Built-in category colors.
 * Any user-created category automatically falls back to "Other".
 */
export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  AI: {
    accent: "#A78BFA",
    bg: "rgba(167,139,250,0.12)",
    text: "#C4B5FD",
  },

  Jobs: {
    accent: "#4FD1C5",
    bg: "rgba(79,209,197,0.12)",
    text: "#5EEAD4",
  },

  Education: {
    accent: "#60A5FA",
    bg: "rgba(96,165,250,0.12)",
    text: "#93C5FD",
  },

  Development: {
    accent: "#34D399",
    bg: "rgba(52,211,153,0.12)",
    text: "#6EE7B7",
  },

  Career: {
    accent: "#F2B705",
    bg: "rgba(242,183,5,0.12)",
    text: "#F7CE4A",
  },

  Entertainment: {
    accent: "#F472B6",
    bg: "rgba(244,114,182,0.12)",
    text: "#F9A8D4",
  },

  Email: {
    accent: "#FB7185",
    bg: "rgba(251,113,133,0.12)",
    text: "#FDA4AF",
  },

  "Social Media": {
    accent: "#22D3EE",
    bg: "rgba(34,211,238,0.12)",
    text: "#67E8F9",
  },

  Freelancing: {
    accent: "#FB923C",
    bg: "rgba(251,146,60,0.12)",
    text: "#FDBA74",
  },

  Other: {
    accent: "#94A3B8",
    bg: "rgba(148,163,184,0.12)",
    text: "#CBD5E1",
  },
};

/**
 * Fallback style used by custom categories.
 */
const DEFAULT_CATEGORY_STYLE = CATEGORY_STYLE.Other;

/**
 * Returns the correct style for any category.
 */
export function getCategoryStyle(
  category: string
): CategoryStyle {
  return (
    CATEGORY_STYLE[category] ??
    DEFAULT_CATEGORY_STYLE
  );
}

export function getCategoryAccent(
  category: string
): string {
  return getCategoryStyle(category).accent;
}

export function getCategoryBackground(
  category: string
): string {
  return getCategoryStyle(category).bg;
}

export function getCategoryText(
  category: string
): string {
  return getCategoryStyle(category).text;
}

/**
 * Returns Google's favicon for a website.
 */
export function faviconFor(url: string): string {
  try {
    const normalized = /^https?:\/\//i.test(url)
      ? url
      : `https://${url}`;

    return `https://www.google.com/s2/favicons?sz=64&domain=${
      new URL(normalized).hostname
    }`;
  } catch {
    return "";
  }
}

/**
 * Converts an ISO date into a human-readable relative time.
 */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();

  if (Number.isNaN(then)) {
    return "—";
  }

  const diffMs = Date.now() - then;

  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);

  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}
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
    accent: "var(--category-ai)",
    bg: "color-mix(in srgb, var(--category-ai) 12%, transparent)",
    text: "var(--category-text)",
  },

  Jobs: {
    accent: "var(--category-jobs)",
    bg: "color-mix(in srgb, var(--category-jobs) 12%, transparent)",
    text: "var(--category-text)",
  },

  Education: {
    accent: "var(--category-education)",
    bg: "color-mix(in srgb, var(--category-education) 12%, transparent)",
    text: "var(--category-text)",
  },

  Development: {
    accent: "var(--category-development)",
    bg: "color-mix(in srgb, var(--category-development) 12%, transparent)",
    text: "var(--category-text)",
  },

  Career: {
    accent: "var(--category-career)",
    bg: "color-mix(in srgb, var(--category-career) 12%, transparent)",
    text: "var(--category-text)",
  },

  Entertainment: {
    accent: "var(--category-entertainment)",
    bg: "color-mix(in srgb, var(--category-entertainment) 12%, transparent)",
    text: "var(--category-text)",
  },

  Email: {
    accent: "var(--category-email)",
    bg: "color-mix(in srgb, var(--category-email) 12%, transparent)",
    text: "var(--category-text)",
  },

  "Social Media": {
    accent: "var(--category-social)",
    bg: "color-mix(in srgb, var(--category-social) 12%, transparent)",
    text: "var(--category-text)",
  },

  Freelancing: {
    accent: "var(--category-freelancing)",
    bg: "color-mix(in srgb, var(--category-freelancing) 12%, transparent)",
    text: "var(--category-text)",
  },

  Other: {
    accent: "var(--category-other)",
    bg: "color-mix(in srgb, var(--category-other) 12%, transparent)",
    text: "var(--category-text)",
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
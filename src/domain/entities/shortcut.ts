/**
 * Domain layer — pure business objects.
 * No framework, no backend SDK, no React imports allowed in this file.
 */

export const CATEGORIES = [
  "Email",
  "Social Media",
  "Entertainment",
  "Development",
  "AI",
  "Education",
  "Career",
  "Jobs",
  "Freelancing",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ShortcutStatus = "Available" | "Missing";

export interface Shortcut {
  id: string;
  name: string;
  url: string;
  category: Category;
  owner: string;
  created: string;
  updated: string;
}

/** New-shortcut payload (no id/owner/timestamps — those are assigned by the backend). */
export interface NewShortcut {
  name: string;
  url: string;
  category: Category;
}

export type ShortcutUpdate = Partial<NewShortcut>;

/** Status is derived, never persisted — it can never drift out of sync with `url`. */
export function deriveStatus(shortcut: Pick<Shortcut, "url">): ShortcutStatus {
  return isValidUrl(shortcut.url) ? "Available" : "Missing";
}

export function isValidUrl(value: string): boolean {
  if (!value || !value.trim()) return false;
  try {
    // Accept bare domains like "youtube.com" the same way the spreadsheet did.
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    new URL(candidate);
    return true;
  } catch {
    return false;
  }
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export class ShortcutValidationError extends Error {
  constructor(public readonly field: keyof NewShortcut, message: string) {
    super(message);
    this.name = "ShortcutValidationError";
  }
}

export function validateNewShortcut(input: NewShortcut): void {
  if (!input.name || !input.name.trim()) {
    throw new ShortcutValidationError("name", "Name is required.");
  }
  if (input.name.trim().length > 100) {
    throw new ShortcutValidationError("name", "Name must be 100 characters or fewer.");
  }
  if (!input.url || !isValidUrl(input.url)) {
    throw new ShortcutValidationError("url", "Enter a valid URL.");
  }
  if (!CATEGORIES.includes(input.category)) {
    throw new ShortcutValidationError("category", "Choose a valid category.");
  }
}

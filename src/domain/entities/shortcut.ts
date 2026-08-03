/**
 * Domain layer — pure business objects.
 * No framework, no backend SDK, no React imports allowed in this file.
 */

/**
 * Built-in categories shipped with the application.
 * Users can create additional categories, so these are only defaults.
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

/**
 * Categories are now dynamic.
 * Any custom category created by the user is allowed.
 */
export type Category = string;

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

/**
 * Payload used when creating a shortcut.
 */
export interface NewShortcut {
  name: string;
  url: string;
  category: Category;
}

export type ShortcutUpdate = Partial<NewShortcut>;

/**
 * Status is derived from the URL and never stored.
 */
export function deriveStatus(
  shortcut: Pick<Shortcut, "url">
): ShortcutStatus {
  return isValidUrl(shortcut.url)
    ? "Available"
    : "Missing";
}

/**
 * Validates whether a URL is usable.
 * Accepts both:
 *  - youtube.com
 *  - https://youtube.com
 */
export function isValidUrl(value: string): boolean {
  if (!value || !value.trim()) return false;

  try {
    const candidate = /^https?:\/\//i.test(value)
      ? value
      : `https://${value}`;

    new URL(candidate);

    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures every stored URL has a protocol.
 */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return trimmed;

  return /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
}

export class ShortcutValidationError extends Error {
  constructor(
    public readonly field: keyof NewShortcut,
    message: string
  ) {
    super(message);
    this.name = "ShortcutValidationError";
  }
}

/**
 * Validates a new shortcut.
 *
 * Categories are no longer restricted to the built-in list.
 * Any non-empty category is accepted.
 */
export function validateNewShortcut(
  input: NewShortcut
): void {
  const name = input.name.trim();
  const url = input.url.trim();
  const category = input.category.trim();

  if (!name) {
    throw new ShortcutValidationError(
      "name",
      "Name is required."
    );
  }

  if (name.length > 100) {
    throw new ShortcutValidationError(
      "name",
      "Name must be 100 characters or fewer."
    );
  }

  if (!url) {
    throw new ShortcutValidationError(
      "url",
      "URL is required."
    );
  }

  if (!isValidUrl(url)) {
    throw new ShortcutValidationError(
      "url",
      "Enter a valid URL."
    );
  }

  if (!category) {
    throw new ShortcutValidationError(
      "category",
      "Category is required."
    );
  }

  if (category.length > 30) {
    throw new ShortcutValidationError(
      "category",
      "Category must be 30 characters or fewer."
    );
  }
}
import {
  CATEGORIES,
  ShortcutValidationError,
  isValidUrl,
  normalizeUrl,
  validateNewShortcut,
  type Category,
  type NewShortcut,
} from "@/domain/entities/shortcut";
import type { ShortcutViewModel } from "../dto/shortcut-dto";
import type { ImportPreview, ValidatedImportRow } from "../dto/import-export-dto";

const CATEGORY_SET = new Set<string>(CATEGORIES);

/**
 * Turns whatever came out of a JSON/CSV/XLSX file (loosely-typed rows with
 * unpredictable keys and casing) into validated NewShortcut candidates,
 * flagging duplicates against both the account's existing shortcuts and
 * other rows earlier in the same file.
 *
 * Duplicate detection key: the URL, normalized (protocol/case/trailing-
 * slash insensitive). This is the most reliable single signal available —
 * two rows with the same URL but different display names are still the
 * same bookmark for the app's purposes.
 */
export function validateImportRows(rawRows: unknown[], existing: ShortcutViewModel[]): ImportPreview {
  const existingByUrl = new Map(existing.map((s) => [normalizeForCompare(s.url), s]));
  const seenInFile = new Set<string>();

  const rows: ValidatedImportRow[] = rawRows.map((raw, index) => {
    const record = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    const name = coerceString(pick(record, ["name", "Name", "site", "Site Name", "Site"]));
    const urlRaw = coerceString(pick(record, ["url", "URL", "link", "Site Link", "Link"]));
    const category = coerceCategory(pick(record, ["category", "Category"]));

    if (!name) {
      return invalidRow(index, name, urlRaw, category, "Missing name.");
    }
    if (!urlRaw || !isValidUrl(urlRaw)) {
      return invalidRow(index, name, urlRaw, category, "Missing or invalid URL.");
    }

    const data: NewShortcut = { name, url: normalizeUrl(urlRaw), category };
    try {
      validateNewShortcut(data);
    } catch (err) {
      const message = err instanceof ShortcutValidationError ? err.message : "Invalid row.";
      return invalidRow(index, name, urlRaw, category, message);
    }

    const key = normalizeForCompare(data.url);
    const existingMatch = existingByUrl.get(key);
    const duplicateInFile = seenInFile.has(key);
    seenInFile.add(key);

    if (existingMatch) {
      return { row: index + 1, data, status: "duplicate", duplicateOf: existingMatch.id, note: "Already saved." };
    }
    if (duplicateInFile) {
      return { row: index + 1, data, status: "duplicate", note: "Duplicated within this file." };
    }
    return { row: index + 1, data, status: "valid" };
  });

  return {
    total: rows.length,
    validCount: rows.filter((r) => r.status === "valid").length,
    duplicateCount: rows.filter((r) => r.status === "duplicate").length,
    invalidCount: rows.filter((r) => r.status === "invalid").length,
    rows,
  };
}

function invalidRow(
  index: number,
  name: string,
  url: string,
  category: Category,
  note: string
): ValidatedImportRow {
  return { row: index + 1, data: { name, url, category }, status: "invalid", note };
}

function pick(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  return undefined;
}

function coerceString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function coerceCategory(value: unknown): Category {
  const str = typeof value === "string" ? value.trim() : "";
  return CATEGORY_SET.has(str) ? (str as Category) : "Other";
}

function normalizeForCompare(url: string): string {
  return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

import type { Category, NewShortcut } from "@/domain/entities/shortcut";

export type ExportFormat = "json" | "csv" | "xlsx";
export type DuplicateStrategy = "skip" | "replace" | "keep-both";

export interface ExportRow {
  name: string;
  url: string;
  category: Category;
  status: "Available" | "Missing";
  created: string;
}

export type ImportRowStatus = "valid" | "duplicate" | "invalid";

export interface ValidatedImportRow {
  row: number;
  data: NewShortcut;
  status: ImportRowStatus;
  /** Human-readable reason — shown in the preview table for duplicate/invalid rows. */
  note?: string;
  /** Set when status is "duplicate" and it matches an existing saved shortcut (not just another row in the file). */
  duplicateOf?: string;
}

export interface ImportPreview {
  total: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  rows: ValidatedImportRow[];
}

export interface ImportRunResult {
  imported: number;
  skipped: number;
  failed: number;
}

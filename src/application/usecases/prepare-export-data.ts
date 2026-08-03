import type { ShortcutViewModel } from "../dto/shortcut-dto";
import type { ExportRow } from "../dto/import-export-dto";

/**
 * Pure mapping from the app's in-memory shortcut list to the flat shape
 * that gets written out as JSON/CSV/XLSX. Kept separate from the actual
 * file-format encoding (infrastructure/io/export-formatters.ts) so this
 * part has zero dependency on any file-format library.
 */
export function prepareExportRows(shortcuts: ShortcutViewModel[]): ExportRow[] {
  return shortcuts.map((s) => ({
    name: s.name,
    url: s.url,
    category: s.category,
    status: s.status,
    created: s.created,
  }));
}

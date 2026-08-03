import type { DuplicateStrategy, ImportRunResult, ValidatedImportRow } from "../dto/import-export-dto";
import type { CreateShortcut } from "./create-shortcut";
import type { UpdateShortcut } from "./update-shortcut";

export type ImportProgressCallback = (done: number, total: number) => void;

/**
 * Executes an already-validated, already-previewed import. Only depends on
 * the two existing use cases (which in turn depend only on the repository
 * interface) — no Appwrite, no file-format library, nothing browser-specific.
 * Invalid rows are never actionable; they're excluded before this runs.
 */
export class ImportShortcuts {
  constructor(
    private readonly createShortcut: CreateShortcut,
    private readonly updateShortcut: UpdateShortcut
  ) {}

  async execute(
    rows: ValidatedImportRow[],
    strategy: DuplicateStrategy,
    onProgress?: ImportProgressCallback
  ): Promise<ImportRunResult> {
    const actionable = rows.filter((r) => r.status !== "invalid");
    let imported = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < actionable.length; i++) {
      const row = actionable[i];
      try {
        if (row.status === "duplicate" && row.duplicateOf) {
          if (strategy === "skip") {
            skipped++;
          } else if (strategy === "replace") {
            await this.updateShortcut.execute(row.duplicateOf, row.data);
            imported++;
          } else {
            // keep-both: import the duplicate as a brand-new shortcut
            await this.createShortcut.execute(row.data);
            imported++;
          }
        } else {
          // "valid", or a duplicate found only within the file itself
          // (no existing record to skip/replace against) — always create.
          await this.createShortcut.execute(row.data);
          imported++;
        }
      } catch {
        failed++;
      }
      onProgress?.(i + 1, actionable.length);
    }

    return { imported, skipped, failed };
  }
}

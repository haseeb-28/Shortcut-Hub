import type { ExportRow } from "@/application/dto/import-export-dto";

const EXPORT_COLUMNS: (keyof ExportRow)[] = ["name", "url", "category", "status", "created"];

export function exportAsJson(rows: ExportRow[]): Blob {
  const json = JSON.stringify(rows, null, 2);
  return new Blob([json], { type: "application/json" });
}

export async function exportAsCsv(rows: ExportRow[]): Promise<Blob> {
  // papaparse is only needed for CSV export — loaded on demand rather than
  // bundled into every route that imports this module's sibling functions.
  const { unparse } = await import("papaparse");
  const csv = unparse(rows, { columns: EXPORT_COLUMNS as string[] });
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}

export async function exportAsXlsx(rows: ExportRow[]): Promise<Blob> {
  // Same idea for xlsx (SheetJS) — it's one of the heavier libraries this
  // app touches, so it's kept out of the main bundle entirely until export.
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: EXPORT_COLUMNS as string[] });
  worksheet["!cols"] = [{ wch: 28 }, { wch: 45 }, { wch: 16 }, { wch: 12 }, { wch: 22 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Shortcuts");
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

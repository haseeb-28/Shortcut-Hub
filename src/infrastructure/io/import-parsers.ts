const MAX_IMPORT_FILE_BYTES = 5 * 1024 * 1024; // 5MB — generous for a personal shortcut list; guards against a pathological upload freezing the tab

/**
 * Reads any supported backup file into an array of loosely-typed row
 * objects. Format-specific parsing libraries are dynamically imported so
 * neither papaparse nor xlsx ships in the main bundle until Import is used.
 */
export async function parseImportFile(file: File): Promise<unknown[]> {
  if (file.size === 0) {
    throw new Error("That file is empty.");
  }
  if (file.size > MAX_IMPORT_FILE_BYTES) {
    throw new Error("That file is too large — the limit is 5MB.");
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "json") return parseJson(file);
  if (ext === "csv") return parseCsv(file);
  if (ext === "xlsx" || ext === "xls") return parseXlsx(file);
  throw new Error("Unsupported file type — please use a .json, .csv, or .xlsx file.");
}

async function parseJson(file: File): Promise<unknown[]> {
  const text = await file.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That JSON file couldn't be parsed — check that it's valid JSON.");
  }
  if (!Array.isArray(data)) {
    throw new Error("Expected a JSON array of shortcuts (e.g. the file this app exports).");
  }
  if (data.length === 0) {
    throw new Error("That file doesn't contain any rows to import.");
  }
  return data;
}

async function parseCsv(file: File): Promise<unknown[]> {
  const Papa = await import("papaparse");
  const text = await file.text();
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.data.length === 0) {
    throw new Error("That CSV couldn't be read — check it has a header row (name, url, category).");
  }
  return result.data;
}

async function parseXlsx(file: File): Promise<unknown[]> {
  const XLSX = await import("xlsx");
  let workbook;
  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    throw new Error("That Excel file appears to be corrupted or unreadable.");
  }
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("That workbook doesn't contain any sheets.");
  }
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet);
  if (rows.length === 0) {
    throw new Error("That sheet doesn't contain any rows to import.");
  }
  return rows;
}

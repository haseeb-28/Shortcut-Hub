export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildBackupFilename(format: "json" | "csv" | "xlsx"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `shortcut-hub-backup-${date}.${format}`;
}

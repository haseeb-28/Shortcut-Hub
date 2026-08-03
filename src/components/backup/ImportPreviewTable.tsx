"use client";

import { memo } from "react";
import type { ValidatedImportRow } from "@/application/dto/import-export-dto";
import { getCategoryStyle } from "@/lib/utils";

interface Props {
  rows: ValidatedImportRow[];
}

const MAX_RENDERED_ROWS = 300;

function ImportPreviewTableInner({ rows }: Props) {
  const visible = rows.slice(0, MAX_RENDERED_ROWS);
  const truncated = rows.length - visible.length;

  return (
    <div className="rounded-lg border border-border">
      <div className="max-h-56 overflow-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-ink-800">
            <tr className="font-mono text-[10px] uppercase tracking-wide text-ink2">
              <th className="px-3 py-2 font-normal">#</th>
              <th className="px-3 py-2 font-normal">Name</th>
              <th className="px-3 py-2 font-normal">Category</th>
              <th className="px-3 py-2 font-normal">Status</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((row) => {
              const style = getCategoryStyle(row.data.category);

              return (
                <tr
                  key={row.row}
                  className="border-t border-border/60"
                >
                  <td className="px-3 py-1.5 font-mono text-[11px] text-ink2">
                    {row.row}
                  </td>

                  <td
                    className="max-w-[160px] truncate px-3 py-1.5 font-body text-xs text-mist"
                    title={row.data.name}
                  >
                    {row.data.name || (
                      <span className="text-ink2">—</span>
                    )}
                  </td>

                  <td className="px-3 py-1.5">
                    <span
                      className="rounded-md px-1.5 py-0.5 font-mono text-[10px]"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                      }}
                    >
                      {row.data.category}
                    </span>
                  </td>

                  <td className="px-3 py-1.5">
                    <StatusBadge row={row} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {truncated > 0 && (
        <p className="border-t border-border/60 px-3 py-2 font-mono text-[10px] text-ink2">
          + {truncated} more rows not shown (still included
          in the import)
        </p>
      )}
    </div>
  );
}

function StatusBadge({
  row,
}: {
  row: ValidatedImportRow;
}) {
  const styles: Record<
    ValidatedImportRow["status"],
    string
  > = {
    valid: "text-teal",
    duplicate: "text-amber",
    invalid: "text-danger",
  };

  const bg: Record<
    ValidatedImportRow["status"],
    string
  > = {
    valid: "rgba(79,209,197,0.12)",
    duplicate: "rgba(242,183,5,0.12)",
    invalid: "rgba(242,85,90,0.12)",
  };

  return (
    <span
      className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${styles[row.status]}`}
      style={{
        backgroundColor: bg[row.status],
      }}
      title={row.note}
    >
      {row.status}
    </span>
  );
}

// Prevent unnecessary rerenders for large imports.
export const ImportPreviewTable = memo(
  ImportPreviewTableInner
);
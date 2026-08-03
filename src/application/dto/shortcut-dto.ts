import type { Shortcut, ShortcutStatus } from "@/domain/entities/shortcut";
import { deriveStatus } from "@/domain/entities/shortcut";

/** What the UI actually renders — a Shortcut plus its derived status. */
export interface ShortcutViewModel extends Shortcut {
  status: ShortcutStatus;
}

export function toViewModel(shortcut: Shortcut): ShortcutViewModel {
  return { ...shortcut, status: deriveStatus(shortcut) };
}

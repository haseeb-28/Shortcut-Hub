import type { NewShortcut, Shortcut, ShortcutUpdate } from "../entities/shortcut";

/**
 * Port (interface) the application layer depends on.
 * Infrastructure provides the implementation (e.g. Appwrite).
 * This file has zero knowledge of Appwrite, fetch, or any transport.
 */
export interface ShortcutRepository {
  list(): Promise<Shortcut[]>;
  create(input: NewShortcut): Promise<Shortcut>;
  update(id: string, input: ShortcutUpdate): Promise<Shortcut>;
  remove(id: string): Promise<void>;
}

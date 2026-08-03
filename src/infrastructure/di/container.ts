import { CreateShortcut } from "@/application/usecases/create-shortcut";
import { DeleteShortcut } from "@/application/usecases/delete-shortcut";
import { ImportShortcuts } from "@/application/usecases/import-shortcuts";
import { ListShortcuts } from "@/application/usecases/list-shortcuts";
import { UpdateShortcut } from "@/application/usecases/update-shortcut";
import { AppwriteShortcutRepository } from "../appwrite/repositories/shortcut-repository";

/**
 * Composition root: the ONLY place that wires a domain interface to a concrete
 * implementation. This used to wire PocketBaseShortcutRepository; swapping to
 * Appwrite meant changing exactly this one import — nothing in application/,
 * domain/, hooks/, or components/ changed.
 */
const shortcutRepository = new AppwriteShortcutRepository();

const createShortcut = new CreateShortcut(shortcutRepository);
const updateShortcut = new UpdateShortcut(shortcutRepository);

export const container = {
  listShortcuts: new ListShortcuts(shortcutRepository),
  createShortcut,
  updateShortcut,
  deleteShortcut: new DeleteShortcut(shortcutRepository),
  // Backup & Restore: reuses createShortcut/updateShortcut rather than
  // touching the repository directly, so it inherits their validation and
  // normalization for free.
  importShortcuts: new ImportShortcuts(createShortcut, updateShortcut),
};

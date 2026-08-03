import { CreateShortcut } from "@/application/usecases/create-shortcut";
import { DeleteShortcut } from "@/application/usecases/delete-shortcut";
import { ImportShortcuts } from "@/application/usecases/import-shortcuts";
import { ListShortcuts } from "@/application/usecases/list-shortcuts";
import { UpdateShortcut } from "@/application/usecases/update-shortcut";

import { AppwriteShortcutRepository } from "../appwrite/repositories/shortcut-repository";
import { AppwriteCategoryRepository } from "../appwrite/repositories/category-repository";

/**
 * Repositories
 */
export const shortcutRepository = new AppwriteShortcutRepository();
export const categoryRepository = new AppwriteCategoryRepository();

/**
 * Shortcut Use Cases
 */
const createShortcut = new CreateShortcut(shortcutRepository);
const updateShortcut = new UpdateShortcut(shortcutRepository);

export const container = {
  listShortcuts: new ListShortcuts(shortcutRepository),

  createShortcut,

  updateShortcut,

  deleteShortcut: new DeleteShortcut(shortcutRepository),

  importShortcuts: new ImportShortcuts(
    createShortcut,
    updateShortcut
  ),
};
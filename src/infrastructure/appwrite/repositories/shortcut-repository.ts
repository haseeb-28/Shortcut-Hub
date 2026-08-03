import { ID, Permission, Query, Role, type Models } from "appwrite";

import type {
  NewShortcut,
  Shortcut,
  ShortcutUpdate,
} from "@/domain/entities/shortcut";

import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";

import {
  APPWRITE_DATABASE_ID,
  APPWRITE_SHORTCUTS_COLLECTION_ID,
  account,
  databases,
} from "../client";

import { AppwriteCategoryRepository } from "./category-repository";

type ShortcutDocument = Models.Document & {
  name: string;
  url: string;
  category: Shortcut["category"];
  owner: string;
};

function toEntity(doc: ShortcutDocument): Shortcut {
  return {
    id: doc.$id,
    name: doc.name,
    url: doc.url,
    category: doc.category,
    owner: doc.owner,
    created: doc.$createdAt,
    updated: doc.$updatedAt,
  };
}

export class AppwriteShortcutRepository
  implements ShortcutRepository
{
  private categoryRepository =
    new AppwriteCategoryRepository();

  private async currentUserId(): Promise<string> {
    const user = await account.get();
    return user.$id;
  }

  /**
   * Automatically creates the category if it
   * doesn't already exist.
   */
  private async ensureCategoryExists(
    category: string
  ): Promise<void> {
    const trimmed = category.trim();

    if (!trimmed) return;

    const categories =
      await this.categoryRepository.list();

    const exists = categories.some(
      (c) =>
        c.name.toLowerCase() ===
        trimmed.toLowerCase()
    );

    if (!exists) {
      await this.categoryRepository.create({
        name: trimmed,
      });
    }
  }

  async list(): Promise<Shortcut[]> {
    const userId = await this.currentUserId();

    const res =
      await databases.listDocuments<ShortcutDocument>(
        APPWRITE_DATABASE_ID,
        APPWRITE_SHORTCUTS_COLLECTION_ID,
        [
          Query.equal("owner", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(500),
        ]
      );

    return res.documents.map(toEntity);
  }

  async create(
    input: NewShortcut
  ): Promise<Shortcut> {
    const userId =
      await this.currentUserId();

    await this.ensureCategoryExists(
      input.category
    );

    const doc =
      await databases.createDocument<ShortcutDocument>(
        APPWRITE_DATABASE_ID,
        APPWRITE_SHORTCUTS_COLLECTION_ID,
        ID.unique(),
        {
          ...input,
          owner: userId,
        },
        [
          Permission.read(
            Role.user(userId)
          ),
          Permission.update(
            Role.user(userId)
          ),
          Permission.delete(
            Role.user(userId)
          ),
        ]
      );

    return toEntity(doc);
  }

  async update(
    id: string,
    input: ShortcutUpdate
  ): Promise<Shortcut> {
    if (input.category) {
      await this.ensureCategoryExists(
        input.category
      );
    }

    const doc =
      await databases.updateDocument<ShortcutDocument>(
        APPWRITE_DATABASE_ID,
        APPWRITE_SHORTCUTS_COLLECTION_ID,
        id,
        input
      );

    return toEntity(doc);
  }

  async remove(id: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_SHORTCUTS_COLLECTION_ID,
      id
    );
  }
}
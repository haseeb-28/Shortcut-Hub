import { ID, Permission, Query, Role, type Models } from "appwrite";
import type { NewShortcut, Shortcut, ShortcutUpdate } from "@/domain/entities/shortcut";
import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";
import { APPWRITE_DATABASE_ID, APPWRITE_SHORTCUTS_COLLECTION_ID, account, databases } from "../client";

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

/**
 * Adapter: implements the domain's ShortcutRepository port using Appwrite
 * Databases. Nothing outside this file (and client.ts) knows Appwrite exists.
 *
 * Security model: every document is created with read/update/delete
 * permissions scoped to its creator (Role.user(userId)) — see README §8.
 * The `owner` attribute is kept alongside that for query filtering and as a
 * defense-in-depth check, mirroring the PocketBase `owner = @request.auth.id`
 * rule this replaces.
 */
export class AppwriteShortcutRepository implements ShortcutRepository {
  private async currentUserId(): Promise<string> {
    const user = await account.get();
    return user.$id;
  }

  async list(): Promise<Shortcut[]> {
    const userId = await this.currentUserId();
    const res = await databases.listDocuments<ShortcutDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_SHORTCUTS_COLLECTION_ID,
      [Query.equal("owner", userId), Query.orderDesc("$createdAt"), Query.limit(500)]
    );
    return res.documents.map(toEntity);
  }

  async create(input: NewShortcut): Promise<Shortcut> {
    const userId = await this.currentUserId();
    const doc = await databases.createDocument<ShortcutDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_SHORTCUTS_COLLECTION_ID,
      ID.unique(),
      { ...input, owner: userId },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );
    return toEntity(doc);
  }

  async update(id: string, input: ShortcutUpdate): Promise<Shortcut> {
    const doc = await databases.updateDocument<ShortcutDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_SHORTCUTS_COLLECTION_ID,
      id,
      input
    );
    return toEntity(doc);
  }

  async remove(id: string): Promise<void> {
    await databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_SHORTCUTS_COLLECTION_ID, id);
  }
}

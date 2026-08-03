import { ID, Permission, Query, Role, type Models } from "appwrite";
import type { Category, NewCategory } from "@/domain/entities/category";
import type { CategoryRepository } from "@/domain/repositories/category-repository";
import {
  APPWRITE_DATABASE_ID,
  APPWRITE_CATEGORIES_COLLECTION_ID,
  account,
  databases,
} from "../client";

type CategoryDocument = Models.Document & {
  name: string;
  owner: string;
};

function toEntity(doc: CategoryDocument): Category {
  return {
    id: doc.$id,
    name: doc.name,
    owner: doc.owner,
  };
}

export class AppwriteCategoryRepository implements CategoryRepository {
  private async currentUserId(): Promise<string> {
    const user = await account.get();
    return user.$id;
  }

  async list(): Promise<Category[]> {
    const userId = await this.currentUserId();

    const res = await databases.listDocuments<CategoryDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_CATEGORIES_COLLECTION_ID,
      [
        Query.equal("owner", userId),
        Query.orderAsc("name"),
        Query.limit(500),
      ]
    );

    return res.documents.map(toEntity);
  }

  async create(input: NewCategory): Promise<Category> {
    const userId = await this.currentUserId();

    const doc = await databases.createDocument<CategoryDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_CATEGORIES_COLLECTION_ID,
      ID.unique(),
      {
        name: input.name.trim(),
        owner: userId,
      },
      [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId)),
      ]
    );

    return toEntity(doc);
  }

  async update(id: string, name: string): Promise<Category> {
    const doc = await databases.updateDocument<CategoryDocument>(
      APPWRITE_DATABASE_ID,
      APPWRITE_CATEGORIES_COLLECTION_ID,
      id,
      {
        name: name.trim(),
      }
    );

    return toEntity(doc);
  }

  async delete(id: string): Promise<void> {
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CATEGORIES_COLLECTION_ID,
      id
    );
  }
}
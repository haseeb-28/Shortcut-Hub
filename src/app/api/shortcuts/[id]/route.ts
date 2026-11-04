import { ID, Query, type Models } from "appwrite";
import { NextResponse } from "next/server";
import type { Shortcut, ShortcutUpdate } from "@/domain/entities/shortcut";
import { normalizeUrl, validateNewShortcut } from "@/domain/entities/shortcut";
import { validateCategoryName } from "@/domain/entities/category";
import {
  apiErrorResponse,
  ApiError,
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  readJsonObject,
  requireVerifiedUser,
  updateDocument,
} from "../../_lib/verified-appwrite";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const shortcutsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID ?? "";
const categoriesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID ?? "";

type ShortcutDocument = Models.Document & {
  name: string;
  url: string;
  category: string;
  owner: string;
};

function toShortcut(document: ShortcutDocument): Shortcut {
  return {
    id: document.$id,
    name: document.name,
    url: document.url,
    category: document.category,
    owner: document.owner,
    created: document.$createdAt,
    updated: document.$updatedAt,
  };
}

async function getOwnedDocument(id: string, owner: string) {
  let document: ShortcutDocument;
  try {
    document = await getDocument<ShortcutDocument>(
      databaseId,
      shortcutsCollectionId,
      id
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw error;
  }

  if (document.owner !== owner) {
    throw new ApiError(404, "not_found", "Shortcut not found.");
  }
  return document;
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const user = await requireVerifiedUser(request);
    const body = await readJsonObject(request);
    const updates: ShortcutUpdate = {};
    if (body.name !== undefined) {
      if (typeof body.name !== "string") {
        throw new ApiError(400, "invalid_shortcut", "Name must be text.");
      }
      updates.name = body.name;
    }
    if (body.url !== undefined) {
      if (typeof body.url !== "string") {
        throw new ApiError(400, "invalid_shortcut", "URL must be text.");
      }
      updates.url = normalizeUrl(body.url);
    }
    if (body.category !== undefined) {
      if (typeof body.category !== "string") {
        throw new ApiError(400, "invalid_shortcut", "Category must be text.");
      }
      updates.category = body.category;
    }
    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, "invalid_shortcut", "Provide a field to update.");
    }

    const current = await getOwnedDocument(context.params.id, user.id);
    const merged = {
      name: updates.name ?? current.name,
      url: updates.url ?? current.url,
      category: updates.category ?? current.category,
    };
    try {
      validateNewShortcut(merged);
      validateCategoryName(merged.category);
    } catch (error) {
      throw new ApiError(
        400,
        "invalid_shortcut",
        error instanceof Error ? error.message : "Shortcut details are invalid."
      );
    }

    if (updates.category) {
      const categories = await listDocuments<Models.Document & { name: string }>(
        databaseId,
        categoriesCollectionId,
        [Query.equal("owner", user.id), Query.limit(500)]
      );
      const exists = categories.documents.some(
        (document) =>
          typeof document.name === "string" &&
          document.name.toLowerCase() === updates.category?.toLowerCase()
      );
      if (!exists) {
        await createDocument(
          databaseId,
          categoriesCollectionId,
          ID.unique(),
          { name: updates.category.trim(), owner: user.id },
          []
        );
      }
    }

    const updated = await updateDocument<ShortcutDocument>(
      databaseId,
      shortcutsCollectionId,
      context.params.id,
      updates
    );
    return NextResponse.json(toShortcut(updated));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const user = await requireVerifiedUser(request);
    await getOwnedDocument(context.params.id, user.id);
    await deleteDocument(
      databaseId,
      shortcutsCollectionId,
      context.params.id
    );
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

import { ID, Query, type Models } from "appwrite";
import { NextResponse } from "next/server";
import type { NewShortcut, Shortcut } from "@/domain/entities/shortcut";
import { normalizeUrl, validateNewShortcut } from "@/domain/entities/shortcut";
import { validateCategoryName } from "@/domain/entities/category";
import {
  apiErrorResponse,
  ApiError,
  createDocument,
  listDocuments,
  readJsonObject,
  requireVerifiedUser,
} from "../_lib/verified-appwrite";

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

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const result = await listDocuments<ShortcutDocument>(
      databaseId,
      shortcutsCollectionId,
      [Query.equal("owner", user.id), Query.orderDesc("$createdAt"), Query.limit(500)]
    );

    return NextResponse.json(result.documents.map(toShortcut));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const body = await readJsonObject(request);
    if (
      typeof body.name !== "string" ||
      typeof body.url !== "string" ||
      typeof body.category !== "string"
    ) {
      throw new ApiError(400, "invalid_shortcut", "Provide a name, URL, and category.");
    }

    const input: NewShortcut = {
      name: body.name,
      url: normalizeUrl(body.url),
      category: body.category,
    };
    try {
      validateNewShortcut(input);
      validateCategoryName(input.category);
    } catch (error) {
      throw new ApiError(
        400,
        "invalid_shortcut",
        error instanceof Error ? error.message : "Shortcut details are invalid."
      );
    }

    const existingCategories = await listDocuments<Models.Document & { name: string }>(
      databaseId,
      categoriesCollectionId,
      [Query.equal("owner", user.id), Query.limit(500)]
    );
    const categoryExists = existingCategories.documents.some(
      (document) =>
        typeof document.name === "string" &&
        document.name.toLowerCase() === input.category.toLowerCase()
    );
    if (!categoryExists) {
      await createDocument(
        databaseId,
        categoriesCollectionId,
        ID.unique(),
        { name: input.category.trim(), owner: user.id },
        []
      );
    }

    const document = await createDocument<ShortcutDocument>(
      databaseId,
      shortcutsCollectionId,
      ID.unique(),
      { ...input, owner: user.id },
      []
    );

    return NextResponse.json(toShortcut(document), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

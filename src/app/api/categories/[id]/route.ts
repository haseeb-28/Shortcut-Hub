import type { Models } from "appwrite";
import { NextResponse } from "next/server";
import type { Category } from "@/domain/entities/category";
import { validateCategoryName } from "@/domain/entities/category";
import {
  apiErrorResponse,
  ApiError,
  deleteDocument,
  getDocument,
  readJsonObject,
  requireVerifiedUser,
  updateDocument,
} from "../../_lib/verified-appwrite";

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "";
const collectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID ?? "";

type CategoryDocument = Models.Document & {
  name: string;
  owner: string;
};

function toCategory(document: CategoryDocument): Category {
  return { id: document.$id, name: document.name, owner: document.owner };
}

async function getOwnedCategory(id: string, owner: string) {
  let document: CategoryDocument;
  try {
    document = await getDocument<CategoryDocument>(
      databaseId,
      collectionId,
      id
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw error;
  }
  if (document.owner !== owner) {
    throw new ApiError(404, "not_found", "Category not found.");
  }
  return document;
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const user = await requireVerifiedUser(request);
    const body = await readJsonObject(request);
    if (typeof body.name !== "string") {
      throw new ApiError(400, "invalid_category", "Category name must be text.");
    }
    let name: string;
    try {
      name = validateCategoryName(body.name);
    } catch (error) {
      throw new ApiError(
        400,
        "invalid_category",
        error instanceof Error ? error.message : "Category name is invalid."
      );
    }

    await getOwnedCategory(context.params.id, user.id);
    const updated = await updateDocument<CategoryDocument>(
      databaseId,
      collectionId,
      context.params.id,
      { name }
    );
    return NextResponse.json(toCategory(updated));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const user = await requireVerifiedUser(request);
    await getOwnedCategory(context.params.id, user.id);
    await deleteDocument(databaseId, collectionId, context.params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

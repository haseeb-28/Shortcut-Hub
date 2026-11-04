import { ID, Query, type Models } from "appwrite";
import { NextResponse } from "next/server";
import type { Category } from "@/domain/entities/category";
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
const collectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID ?? "";

type CategoryDocument = Models.Document & {
  name: string;
  owner: string;
};

function toCategory(document: CategoryDocument): Category {
  return { id: document.$id, name: document.name, owner: document.owner };
}

export async function GET(request: Request) {
  try {
    const user = await requireVerifiedUser(request);
    const result = await listDocuments<CategoryDocument>(
      databaseId,
      collectionId,
      [Query.equal("owner", user.id), Query.orderAsc("name"), Query.limit(500)]
    );
    return NextResponse.json(result.documents.map(toCategory));
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request) {
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

    const document = await createDocument<CategoryDocument>(
      databaseId,
      collectionId,
      ID.unique(),
      { name, owner: user.id },
      []
    );
    return NextResponse.json(toCategory(document), { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

import "server-only";

import { Account, Client } from "appwrite";
import { NextResponse } from "next/server";
import type { Models } from "appwrite";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function requireVerifiedUser(
  request: Request
): Promise<{ id: string }> {
  const authorization = request.headers.get("authorization");
  const jwt = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (!jwt) {
    throw new ApiError(401, "unauthorized", "Sign in to continue.");
  }

  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId) {
    throw new ApiError(500, "server_configuration", "Service is not configured.");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setJWT(jwt);

  try {
    const user = await new Account(client).get();
    if (!user.emailVerification) {
      throw new ApiError(
        403,
        "email_unverified",
        "Verify your email address before accessing your data."
      );
    }

    return { id: user.$id };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "unauthorized", "Sign in to continue.");
  }
}

function appwriteServerConfig() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  if (!endpoint || !projectId || !apiKey) {
    throw new ApiError(500, "server_configuration", "Service is not configured.");
  }

  return { endpoint: endpoint.replace(/\/+$/, ""), projectId, apiKey };
}

async function databaseRequest<T>(
  path: string,
  method: "GET" | "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const { endpoint, projectId, apiKey } = appwriteServerConfig();
  let response: Response;
  try {
    response = await fetch(`${endpoint}/databases/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": projectId,
        "X-Appwrite-Key": apiKey,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(502, "database_unavailable", "The data service is unavailable.");
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new ApiError(404, "not_found", "Document not found.");
    }
    throw new ApiError(502, "database_error", "The data request could not be completed.");
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function listDocuments<T extends Models.Document>(
  databaseId: string,
  collectionId: string,
  queries: string[]
): Promise<{ documents: T[] }> {
  return databaseRequest<{ documents: T[] }>(
    `${encodeURIComponent(databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/list`,
    "POST",
    { queries }
  );
}

export async function getDocument<T extends Models.Document>(
  databaseId: string,
  collectionId: string,
  documentId: string
): Promise<T> {
  return databaseRequest<T>(
    `${encodeURIComponent(databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(documentId)}`,
    "GET"
  );
}

export async function createDocument<T extends Models.Document>(
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>,
  permissions: string[]
): Promise<T> {
  return databaseRequest<T>(
    `${encodeURIComponent(databaseId)}/collections/${encodeURIComponent(collectionId)}/documents`,
    "POST",
    { documentId, data, permissions }
  );
}

export async function updateDocument<T extends Models.Document>(
  databaseId: string,
  collectionId: string,
  documentId: string,
  data: Record<string, unknown>
): Promise<T> {
  return databaseRequest<T>(
    `${encodeURIComponent(databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(documentId)}`,
    "PATCH",
    { data }
  );
}

export async function deleteDocument(
  databaseId: string,
  collectionId: string,
  documentId: string
): Promise<void> {
  return databaseRequest<void>(
    `${encodeURIComponent(databaseId)}/collections/${encodeURIComponent(collectionId)}/documents/${encodeURIComponent(documentId)}`,
    "DELETE"
  );
}

export function apiErrorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  return NextResponse.json(
    { error: "The data request could not be completed.", code: "request_failed" },
    { status: 500 }
  );
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "Request body must be valid JSON.");
  }

  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "invalid_body", "Request body must be an object.");
  }

  return value as Record<string, unknown>;
}

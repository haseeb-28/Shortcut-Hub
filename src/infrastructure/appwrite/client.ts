import { Client, Account, Databases } from "appwrite";

/**
 * Single Appwrite client for the app, configured from public env vars.
 * Safe to expose on the client: Appwrite's web SDK is designed for
 * browser use and relies on project-level + document-level permissions
 * (not a secret key) to keep data scoped to the signed-in user.
 */
const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "";
export const APPWRITE_SHORTCUTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID ?? "";

import { Client, Account, Databases } from "appwrite";

/**
 * Global Appwrite client.
 */

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);

/*
|--------------------------------------------------------------------------
| Database IDs
|--------------------------------------------------------------------------
*/

export const APPWRITE_DATABASE_ID =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "";

export const APPWRITE_SHORTCUTS_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID ?? "";

export const APPWRITE_CATEGORIES_COLLECTION_ID =
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID ?? "";
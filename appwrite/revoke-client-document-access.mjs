/**
 * One-time permission migration after deploying the verified server API.
 *
 * Requires `npm install node-appwrite --no-save` and:
 *   APPLY_PERMISSION_MIGRATION=YES
 *   APPWRITE_API_KEY (databases.read, documents.read, documents.write)
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *   NEXT_PUBLIC_APPWRITE_DATABASE_ID
 *   NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID
 *   NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID
 *
 * The script removes per-document client permissions. Also set both
 * collections' collection-level permissions to empty in the Appwrite Console.
 */
import { Client, Databases, Query } from "node-appwrite";

const required = [
  "APPWRITE_API_KEY",
  "NEXT_PUBLIC_APPWRITE_ENDPOINT",
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  "NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID",
  "NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

if (process.env.APPLY_PERMISSION_MIGRATION !== "YES") {
  throw new Error("Set APPLY_PERMISSION_MIGRATION=YES to apply this permission migration.");
}

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);
const databases = new Databases(client);
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const collectionIds = [
  process.env.NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID,
  process.env.NEXT_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID,
];

let updatedCount = 0;
for (const collectionId of collectionIds) {
  let offset = 0;
  while (true) {
    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.limit(100),
      Query.offset(offset),
    ]);

    for (const document of result.documents) {
      if (document.$permissions.length > 0) {
        await databases.updateDocument(
          databaseId,
          collectionId,
          document.$id,
          {},
          []
        );
        updatedCount += 1;
      }
    }

    offset += result.documents.length;
    if (offset >= result.total || result.documents.length === 0) break;
  }
}

console.log(`Removed client permissions from ${updatedCount} documents.`);
console.log("Now set collection-level permissions to empty for both collections in Appwrite Console.");

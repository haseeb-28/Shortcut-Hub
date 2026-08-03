/**
 * Optional one-time helper: bulk-imports appwrite/seed-data.json (your 44
 * real shortcuts from the original spreadsheet) into your Appwrite Cloud
 * collection, instead of adding them one by one through the UI.
 *
 * This uses the *server* SDK with an API key, so it must be run from your
 * machine (never ship an API key to the browser). See README.md §10.
 *
 * Usage:
 *   npm install node-appwrite --no-save
 *   node appwrite/seed-import.mjs
 *
 * Requires these env vars (same values as .env.local, plus two server-only ones):
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *   NEXT_PUBLIC_APPWRITE_DATABASE_ID
 *   NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID
 *   APPWRITE_API_KEY        (Console → Overview → Integrate → API keys; needs databases.write)
 *   APPWRITE_USER_ID        (Console → Auth → Users → your user → copy the User ID)
 */
import { Client, Databases, ID, Permission, Role } from "node-appwrite";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID,
  APPWRITE_API_KEY,
  APPWRITE_USER_ID,
} = process.env;

for (const [key, value] of Object.entries({
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID,
  APPWRITE_API_KEY,
  APPWRITE_USER_ID,
})) {
  if (!value) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);
const seed = JSON.parse(readFileSync(join(__dirname, "seed-data.json"), "utf-8"));

let created = 0;
for (const item of seed) {
  await databases.createDocument(
    NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    NEXT_PUBLIC_APPWRITE_SHORTCUTS_COLLECTION_ID,
    ID.unique(),
    { name: item.name, url: item.url, category: item.category, owner: APPWRITE_USER_ID },
    [
      Permission.read(Role.user(APPWRITE_USER_ID)),
      Permission.update(Role.user(APPWRITE_USER_ID)),
      Permission.delete(Role.user(APPWRITE_USER_ID)),
    ]
  );
  created += 1;
  console.log(`Imported ${created}/${seed.length}: ${item.name}`);
}

console.log(`Done — ${created} shortcuts imported.`);

import { account } from "./client";

interface ApiErrorBody {
  error?: string;
}

export async function verifiedApiRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { jwt } = await account.createJWT();
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${jwt}`);
  if (init?.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "The request could not be completed.";
    try {
      const body = (await response.json()) as ApiErrorBody;
      if (typeof body.error === "string") message = body.error;
    } catch {
      // Use the generic request error when the response isn't JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

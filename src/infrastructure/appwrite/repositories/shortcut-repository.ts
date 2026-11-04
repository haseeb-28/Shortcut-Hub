import type {
  NewShortcut,
  Shortcut,
  ShortcutUpdate,
} from "@/domain/entities/shortcut";

import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";
import { verifiedApiRequest } from "../verified-api";

export class AppwriteShortcutRepository
  implements ShortcutRepository
{
  async list(): Promise<Shortcut[]> {
    return verifiedApiRequest<Shortcut[]>("/api/shortcuts");
  }

  async create(input: NewShortcut): Promise<Shortcut> {
    return verifiedApiRequest<Shortcut>("/api/shortcuts", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async update(
    id: string,
    input: ShortcutUpdate
  ): Promise<Shortcut> {
    return verifiedApiRequest<Shortcut>(
      `/api/shortcuts/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(input) }
    );
  }

  async remove(id: string): Promise<void> {
    await verifiedApiRequest<void>(
      `/api/shortcuts/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  }
}
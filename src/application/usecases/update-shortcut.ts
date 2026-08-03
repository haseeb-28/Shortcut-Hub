import { normalizeUrl, type ShortcutUpdate } from "@/domain/entities/shortcut";
import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";
import { toViewModel, type ShortcutViewModel } from "../dto/shortcut-dto";

export class UpdateShortcut {
  constructor(private readonly repo: ShortcutRepository) {}

  async execute(id: string, input: ShortcutUpdate): Promise<ShortcutViewModel> {
    const normalized: ShortcutUpdate = {
      ...input,
      ...(input.url ? { url: normalizeUrl(input.url) } : {}),
    };
    const updated = await this.repo.update(id, normalized);
    return toViewModel(updated);
  }
}

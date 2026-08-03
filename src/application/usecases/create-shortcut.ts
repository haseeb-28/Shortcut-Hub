import { normalizeUrl, validateNewShortcut, type NewShortcut } from "@/domain/entities/shortcut";
import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";
import { toViewModel, type ShortcutViewModel } from "../dto/shortcut-dto";

export class CreateShortcut {
  constructor(private readonly repo: ShortcutRepository) {}

  async execute(input: NewShortcut): Promise<ShortcutViewModel> {
    const normalized: NewShortcut = { ...input, url: normalizeUrl(input.url) };
    validateNewShortcut(normalized);
    const created = await this.repo.create(normalized);
    return toViewModel(created);
  }
}

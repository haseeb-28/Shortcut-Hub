import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";
import { toViewModel, type ShortcutViewModel } from "../dto/shortcut-dto";

export class ListShortcuts {
  constructor(private readonly repo: ShortcutRepository) {}

  async execute(): Promise<ShortcutViewModel[]> {
    const shortcuts = await this.repo.list();
    return shortcuts.map(toViewModel).sort((a, b) => a.name.localeCompare(b.name));
  }
}

import type { ShortcutRepository } from "@/domain/repositories/shortcut-repository";

export class DeleteShortcut {
  constructor(private readonly repo: ShortcutRepository) {}

  async execute(id: string): Promise<void> {
    await this.repo.remove(id);
  }
}

import type { Category, NewCategory } from "@/domain/entities/category";
import type { CategoryRepository } from "@/domain/repositories/category-repository";
import { verifiedApiRequest } from "../verified-api";

export class AppwriteCategoryRepository implements CategoryRepository {
  async list(): Promise<Category[]> {
    return verifiedApiRequest<Category[]>("/api/categories");
  }

  async create(input: NewCategory): Promise<Category> {
    return verifiedApiRequest<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async update(id: string, name: string): Promise<Category> {
    return verifiedApiRequest<Category>(
      `/api/categories/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify({ name }) }
    );
  }

  async delete(id: string): Promise<void> {
    await verifiedApiRequest<void>(
      `/api/categories/${encodeURIComponent(id)}`,
      { method: "DELETE" }
    );
  }
}
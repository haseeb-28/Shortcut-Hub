import type { Category, NewCategory } from "../entities/category";

export interface CategoryRepository {
  /**
   * Returns all categories for the current user.
   */
  list(): Promise<Category[]>;

  /**
   * Creates a new category.
   */
  create(input: NewCategory): Promise<Category>;

  /**
   * Renames an existing category.
   */
  update(id: string, name: string): Promise<Category>;

  /**
   * Deletes a category.
   */
  delete(id: string): Promise<void>;
}
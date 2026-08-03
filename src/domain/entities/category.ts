export interface Category {
  id: string;
  name: string;
  owner: string;
}

export interface NewCategory {
  name: string;
}

export class CategoryValidationError extends Error {
  constructor(
    public readonly field: keyof NewCategory,
    message: string
  ) {
    super(message);
    this.name = "CategoryValidationError";
  }
}

export function validateCategoryName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    throw new CategoryValidationError(
      "name",
      "Category name is required."
    );
  }

  if (trimmed.length < 2) {
    throw new CategoryValidationError(
      "name",
      "Category name must be at least 2 characters."
    );
  }

  if (trimmed.length > 30) {
    throw new CategoryValidationError(
      "name",
      "Category name cannot exceed 30 characters."
    );
  }

  return trimmed;
}
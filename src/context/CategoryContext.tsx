"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { CATEGORIES } from "@/domain/entities/shortcut";
import { AppwriteCategoryRepository } from "@/infrastructure/appwrite/repositories/category-repository";
import { authService } from "@/infrastructure/appwrite/auth";
import type { Category } from "@/domain/entities/category";

interface CategoryContextValue {
  categories: string[];
  loading: boolean;
  addCategory(name: string): Promise<void>;
  refresh(): Promise<void>;
}

const CategoryContext =
  createContext<CategoryContextValue | null>(null);

const repository = new AppwriteCategoryRepository();

export function CategoryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [categories, setCategories] = useState<string[]>([
    ...CATEGORIES,
  ]);

  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();

      if (!user) {
        setCategories([...CATEGORIES]);
        return;
      }

      const custom =
        await repository.list();

      const merged = [
        ...CATEGORIES,
        ...custom.map(
          (c: Category) => c.name
        ),
      ];

      setCategories(
        [...new Set(merged)].sort((a, b) =>
          a.localeCompare(b)
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh().catch((error: unknown) => {
      console.error("Failed to load categories:", error);
    });
  }, [refresh]);

  async function addCategory(name: string) {
    const trimmed = name.trim();

    if (!trimmed) return;

    if (
      categories.some(
        (c) =>
          c.toLowerCase() ===
          trimmed.toLowerCase()
      )
    ) {
      return;
    }

    await repository.create({
      name: trimmed,
    });

    await refresh();
  }

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        addCategory,
        refresh,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategoryContext() {
  const ctx = useContext(CategoryContext);

  if (!ctx) {
    throw new Error(
      "useCategoryContext must be used inside CategoryProvider."
    );
  }

  return ctx;
}
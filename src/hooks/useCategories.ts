"use client";

import { useCallback, useEffect, useState } from "react";
import { AppwriteCategoryRepository } from "@/infrastructure/appwrite/repositories/category-repository";
import type { Category } from "@/domain/entities/category";
import { CATEGORIES as DEFAULT_CATEGORIES } from "@/domain/entities/shortcut";

const repository = new AppwriteCategoryRepository();

export function useCategories() {
  const [categories, setCategories] = useState<string[]>([
    ...DEFAULT_CATEGORIES,
  ]);

  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      const custom = await repository.list();

      const merged = [
        ...DEFAULT_CATEGORIES,
        ...custom.map((c: Category) => c.name),
      ];

      const unique = [...new Set(merged)].sort((a, b) =>
        a.localeCompare(b)
      );

      setCategories(unique);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function addCategory(name: string) {
    const trimmed = name.trim();

    if (!trimmed) return;

    if (
      categories.some(
        (c) => c.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      return;
    }

    await repository.create({
      name: trimmed,
    });

    await loadCategories();
  }

  return {
    categories,
    loading,
    addCategory,
    refresh: loadCategories,
  };
}
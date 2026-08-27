'use client';

import { useEffect, useState } from 'react';
import type { CategoryDto } from '@vendorconnect/shared';
import { categoriesApi } from '../api/categories';

let cache: CategoryDto[] | null = null;
let inflight: Promise<CategoryDto[]> | null = null;

/** Fetch categories once per page load and share the result across components. */
export function useCategories(): CategoryDto[] {
  const [categories, setCategories] = useState<CategoryDto[]>(cache ?? []);

  useEffect(() => {
    if (cache) return;
    inflight ??= categoriesApi
      .getAll()
      .then((data) => {
        cache = data;
        return data;
      })
      .catch(() => {
        inflight = null;
        return [] as CategoryDto[];
      });
    void inflight.then(setCategories);
  }, []);

  return categories;
}

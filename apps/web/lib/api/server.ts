import type { CategoryDto, CityStatDto, PlatformStatsDto } from '@vendorconnect/shared';

/**
 * Server-side fetch helpers for React Server Components.
 * Every call fails soft — a down API must never break page render.
 */

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

async function safeGet<T>(path: string, fallback: T, revalidate = 300): Promise<T> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate } });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export const getCategories = () => safeGet<CategoryDto[]>('/categories', [], 3600);
export const getCities = () => safeGet<CityStatDto[]>('/meta/cities', []);
export const getPlatformStats = () => safeGet<PlatformStatsDto | null>('/meta/stats', null);

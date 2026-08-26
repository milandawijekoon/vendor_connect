import type { PaginatedResponse, ReviewDto } from '@vendorconnect/shared';
import { apiClient } from './client';

export const reviewsApi = {
  create: (slug: string, data: { rating: number; comment?: string }) =>
    apiClient.post<ReviewDto>(`/vendors/${slug}/reviews`, data),

  list: (slug: string, page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<ReviewDto>>(`/vendors/${slug}/reviews?page=${page}&limit=${limit}`),
};

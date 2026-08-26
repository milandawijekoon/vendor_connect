import type { PaginatedResponse, PortfolioImageDto, VendorListItemDto, VendorProfileDto, VendorSearchQuery } from '@vendorconnect/shared';
import { apiClient } from './client';
import type { VendorProfileFormValues } from '../validation/vendor';

export const vendorsApi = {
  search: (query: VendorSearchQuery = {}): Promise<PaginatedResponse<VendorListItemDto>> => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();
    return apiClient.get<PaginatedResponse<VendorListItemDto>>(`/vendors${qs ? `?${qs}` : ''}`);
  },

  create: (data: VendorProfileFormValues) =>
    apiClient.post<VendorProfileDto>('/vendors', data),

  getOwn: () =>
    apiClient.get<VendorProfileDto>('/vendors/me'),

  update: (data: Partial<VendorProfileFormValues>) =>
    apiClient.patch<VendorProfileDto>('/vendors/me', data),

  getPublic: (slug: string) =>
    apiClient.get<VendorProfileDto>(`/vendors/${slug}`),

  uploadImage: async (file: File): Promise<PortfolioImageDto> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('wc_token');
    const res = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'}/vendors/me/images`,
      {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      },
    );
    if (!res.ok) {
      const err = (await res.json()) as { message: string };
      throw new Error(err.message);
    }
    return res.json() as Promise<PortfolioImageDto>;
  },

  deleteImage: (imageId: string) =>
    apiClient.delete<void>(`/vendors/me/images/${imageId}`),

  reorderImages: (items: { id: string; order: number }[]) =>
    apiClient.patch<void>('/vendors/me/images/reorder', { items }),
};

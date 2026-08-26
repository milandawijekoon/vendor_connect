import type { AdminStatsDto, AdminVendorDto, PaginatedResponse, VendorStatus } from '@vendorconnect/shared';
import { apiClient } from './client';

export const adminApi = {
  getStats: () => apiClient.get<AdminStatsDto>('/admin/stats'),

  listVendors: (params: { status?: VendorStatus; page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get<PaginatedResponse<AdminVendorDto>>(`/admin/vendors${q ? `?${q}` : ''}`);
  },

  updateVendorStatus: (id: string, status: VendorStatus) =>
    apiClient.patch<AdminVendorDto>(`/admin/vendors/${id}/status`, { status }),
};

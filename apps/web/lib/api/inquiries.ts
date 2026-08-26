import type { InquiryDto, InquiryStatus, PaginatedResponse } from '@vendorconnect/shared';
import { apiClient } from './client';

export const inquiriesApi = {
  create: (slug: string, data: { name: string; email: string; phone: string; eventDate?: string; message: string }) =>
    apiClient.post<InquiryDto>(`/vendors/${slug}/inquiries`, data),

  list: (params: { status?: InquiryStatus; page?: number; limit?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get<PaginatedResponse<InquiryDto>>(`/vendors/me/inquiries${q ? `?${q}` : ''}`);
  },

  updateStatus: (id: string, status: InquiryStatus) =>
    apiClient.patch<InquiryDto>(`/vendors/me/inquiries/${id}`, { status }),
};

import type { GoldPriceSnapshotDto } from '@vendorconnect/shared';
import { apiClient } from './client';

export const goldApi = {
  /** Latest stored daily snapshot, or `null` before the first fetch has run. */
  getLatest: () => apiClient.get<GoldPriceSnapshotDto | null>('/gold-price'),
  getHistory: (days?: number) =>
    apiClient.get<GoldPriceSnapshotDto[]>(`/gold-price/history${days ? `?days=${days}` : ''}`),
};

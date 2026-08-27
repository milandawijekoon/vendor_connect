import type { CityStatDto, PlatformStatsDto } from '@vendorconnect/shared';
import { apiClient } from './client';

export const metaApi = {
  getStats: () => apiClient.get<PlatformStatsDto>('/meta/stats'),
  getCities: () => apiClient.get<CityStatDto[]>('/meta/cities'),
};

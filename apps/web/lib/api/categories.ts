import type { CategoryDto } from '@vendorconnect/shared';
import { apiClient } from './client';

export const categoriesApi = {
  getAll: () => apiClient.get<CategoryDto[]>('/categories'),
};

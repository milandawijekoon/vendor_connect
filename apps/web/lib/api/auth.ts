import type { AuthResponseDto, GoogleLoginRequestDto } from '@vendorconnect/shared';
import { apiClient } from './client';
import type { LoginFormValues, RegisterFormValues } from '../validation/auth';

export const authApi = {
  login: (data: LoginFormValues) =>
    apiClient.post<AuthResponseDto>('/auth/login', data),

  register: (data: RegisterFormValues) =>
    apiClient.post<AuthResponseDto>('/auth/register', data),

  google: (data: GoogleLoginRequestDto) =>
    apiClient.post<AuthResponseDto>('/auth/google', data),

  me: () =>
    apiClient.get<AuthResponseDto['user']>('/auth/me'),

  logout: () =>
    apiClient.post<void>('/auth/logout', undefined),
};

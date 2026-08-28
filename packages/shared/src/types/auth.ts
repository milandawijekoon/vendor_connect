import type { Role } from './enums';

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface GoogleLoginRequestDto {
  /** Google ID token (JWT) from Google Identity Services. */
  idToken: string;
  /** Role to assign on first sign-in; ignored for existing users. */
  role?: 'CUSTOMER' | 'VENDOR';
}

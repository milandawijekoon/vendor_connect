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

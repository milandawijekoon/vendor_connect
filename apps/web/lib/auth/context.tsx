'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUserDto } from '@vendorconnect/shared';
import { authApi } from '../api/auth';
import { clearSession, setSession } from './session';
import type { LoginFormValues, RegisterFormValues } from '../validation/auth';

interface AuthContextValue {
  user: AuthUserDto | null;
  isLoading: boolean;
  login: (data: LoginFormValues) => Promise<void>;
  register: (data: RegisterFormValues) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (data: LoginFormValues) => {
      const { accessToken, user: authUser } = await authApi.login(data);
      setSession(accessToken);
      setUser(authUser);
      router.push(authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/');
    },
    [router],
  );

  const register = useCallback(
    async (data: RegisterFormValues) => {
      const { accessToken, user: authUser } = await authApi.register(data);
      setSession(accessToken);
      setUser(authUser);
      router.push(authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/');
    },
    [router],
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

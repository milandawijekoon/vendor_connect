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
  loginWithGoogle: (idToken: string, role?: 'CUSTOMER' | 'VENDOR') => Promise<void>;
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

  const login = useCallback(async (data: LoginFormValues) => {
    const { accessToken, user: authUser } = await authApi.login(data);
    setSession(accessToken);
    setUser(authUser);
    // Hard navigation (not router.push) so the request round-trips through
    // Next's middleware with the cookie we just set — a client-side push can
    // resolve against stale router state and leave the cookie-gated
    // middleware redirect out of sync with the now-logged-in client state.
    window.location.href = authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/';
  }, []);

  const register = useCallback(async (data: RegisterFormValues) => {
    const { accessToken, user: authUser } = await authApi.register(data);
    setSession(accessToken);
    setUser(authUser);
    window.location.href = authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/';
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string, role?: 'CUSTOMER' | 'VENDOR') => {
    const { accessToken, user: authUser } = await authApi.google(
      role ? { idToken, role } : { idToken },
    );
    setSession(accessToken);
    setUser(authUser);
    window.location.href = authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/';
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

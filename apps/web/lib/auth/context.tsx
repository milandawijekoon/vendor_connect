'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthUserDto } from '@vendorconnect/shared';
import { authApi } from '../api/auth';
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

  useEffect(() => {
    authApi
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (data: LoginFormValues) => {
    const { user: authUser } = await authApi.login(data);
    setUser(authUser);
    window.location.href = authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/';
  }, []);

  const register = useCallback(async (data: RegisterFormValues) => {
    const { user: authUser } = await authApi.register(data);
    setUser(authUser);
    window.location.href = authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/';
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string, role?: 'CUSTOMER' | 'VENDOR') => {
    const { user: authUser } = await authApi.google(role ? { idToken, role } : { idToken });
    setUser(authUser);
    window.location.href = authUser.role === 'VENDOR' ? '/dashboard/vendor' : '/';
  }, []);

  const logout = useCallback(() => {
    void authApi.logout().finally(() => {
      setUser(null);
      window.location.href = '/';
    });
  }, []);

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

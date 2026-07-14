'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthService, { AuthUser } from '@/services/auth.service';
import { showToast } from '@/lib/toast';

export type UserRole =
  | 'super-admin'
  | 'super_admin'
  | 'admin'
  | 'contractor'
  | 'super-contractor'
  | 'super_contractor';

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, role: UserRole, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('VERDEVIA_user');
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // ─── Redirect helpers ──────────────────────────────────────────────────────
  const redirectForRole = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
      case 'super-admin':
        router.push('/super-administrador');
        break;
      case 'admin':
        router.push('/administrador');
        break;
      case 'contractor':
        router.push('/prestadores');
        break;
      case 'super_contractor':
      case 'super-contractor':
        router.push('/super-prestadores');
        break;
      default:
        router.push('/');
    }
  };

  // ─── Login: calls real backend, persists JWT ───────────────────────────────
  const login = async (email: string, role: UserRole, password?: string) => {
    setIsLoading(true);
    try {
      const { user: authUser, token } = await AuthService.login(
        email,
        password ?? ''
      );

      // Verify the returned role matches the expected portal
      const normalizedReturnedRole = authUser.role?.replace(/_/g, '-').toLowerCase();
      const normalizedExpectedRole = role?.replace(/_/g, '-').toLowerCase();

      if (normalizedReturnedRole !== normalizedExpectedRole) {
        throw new Error(
          `Acesso negado. Seu cargo é [${authUser.role}], mas este portal exige [${role}].`
        );
      }

      AuthService.persistSession(authUser, token);
      setUser(authUser);
      redirectForRole(role);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Credenciais inválidas.';
      showToast(message, 'error');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = () => {
    AuthService.clearSession();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

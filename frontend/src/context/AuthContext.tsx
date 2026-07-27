import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '@/types';
import { authApi } from '@/services/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  switchUser: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const switchUser = async (userId: string) => {
    const u = await authApi.switchUser(userId);
    setUser(u);
  };

  return <AuthContext.Provider value={{ user, loading, switchUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

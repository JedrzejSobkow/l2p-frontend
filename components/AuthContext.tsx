import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type MockUser = {
  username: string;
};

type AuthContextValue = {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (username?: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  const login = (username = 'player') => {
    setUser({ username });
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      login,
      logout,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};


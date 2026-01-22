import { useCallback, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext.js';

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(() => {
    const storedUser = localStorage.getItem('authUser');
    return {
      isAuthenticated: Boolean(localStorage.getItem('accessToken')),
      user: storedUser ? JSON.parse(storedUser) : null,
    };
  });

  const login = useCallback(({ accessToken, refreshToken, user }) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    }

    setAuthState({
      isAuthenticated: true,
      user: user || null,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authUser');
    setAuthState({ isAuthenticated: false, user: null });
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      login,
      logout,
    }),
    [authState, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

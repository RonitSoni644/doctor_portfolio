import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(undefined);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoadingAuth: true,
  isLoadingPublicSettings: false,
  authError: null,
  appPublicSettings: null,
  authChecked: false,
  login: async () => ({ user: null }),
  logout: async () => {},
  navigateToLogin: () => {
    window.location.assign('/admin');
  },
  checkUserAuth: async () => ({ user: null, isAuthenticated: false }),
  checkAppState: async () => null,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(defaultAuthState.user);
  const [isLoadingAuth, setIsLoadingAuth] = useState(defaultAuthState.isLoadingAuth);
  const [authError, setAuthError] = useState(defaultAuthState.authError);
  const [authChecked, setAuthChecked] = useState(defaultAuthState.authChecked);
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const response = await authApi.getSession();
      const nextUser = response?.user || null;
      setUser(nextUser);
      setAuthChecked(true);
      return { user: nextUser, isAuthenticated: Boolean(nextUser) };
    } catch (error) {
      setUser(null);
      setAuthChecked(true);
      if (error.message !== 'Request failed.') {
        setAuthError(error.message);
      }
      return { user: null, isAuthenticated: false };
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdminRoute) {
      setIsLoadingAuth(false);
      setAuthChecked(true);
      return;
    }

    void checkUserAuth();
  }, [checkUserAuth, isAdminRoute]);

  const login = useCallback(async (credentials) => {
    setIsLoadingAuth(true);
    setAuthError(null);

    try {
      const response = await authApi.login(credentials);
      setUser(response?.user || null);
      setAuthChecked(true);
      return response;
    } catch (error) {
      setUser(null);
      setAuthChecked(true);
      setAuthError(error.message);
      throw error;
    } finally {
      setIsLoadingAuth(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoadingAuth(true);

    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setAuthChecked(true);
      setAuthError(null);
      setIsLoadingAuth(false);
    }
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authError,
    appPublicSettings: null,
    authChecked,
    login,
    logout,
    navigateToLogin: defaultAuthState.navigateToLogin,
    checkUserAuth,
    checkAppState: defaultAuthState.checkAppState,
  }), [authChecked, authError, checkUserAuth, isLoadingAuth, login, logout, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

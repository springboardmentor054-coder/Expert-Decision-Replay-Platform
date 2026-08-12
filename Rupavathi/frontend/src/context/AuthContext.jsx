import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, extractErrorMessage, getToken, setToken, clearToken } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

const SESSION_KEY = 'edrp_user';

export function AuthProvider({ children }) {
  const { showToast } = useToast();
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(SESSION_KEY);
    return storedUser && getToken() ? JSON.parse(storedUser) : null;
  });

  const isAuthenticated = Boolean(user);

  const register = async (name, email, password, role) => {
    try {
      await authAPI.register(name, email, password, role);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Could not create account. Please try again.'),
      };
    }
  };

  const applySession = (data) => {
    const sessionUser = {
      id: data.user.id,
      name: data.user.full_name,
      email: data.user.email,
      role: data.user.role,
      avatarUrl: data.user.avatar_url || null,
    };
    setToken(data.access_token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);
    return sessionUser;
  };

  const login = async (email, password) => {
    try {
      const { data } = await authAPI.login(email, password);
      applySession(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Invalid email or password. Please try again.'),
      };
    }
  };

  const loginWithGoogle = async (accessToken) => {
    try {
      const { data } = await authAPI.googleLogin(accessToken);
      const sessionUser = applySession(data);
      return { success: true, isNewUser: data.is_new_user, user: sessionUser };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Could not sign in with Google. Please try again.'),
      };
    }
  };

  const loginWithApple = async (idToken, fullName) => {
    try {
      const { data } = await authAPI.appleLogin(idToken, fullName);
      const sessionUser = applySession(data);
      return { success: true, isNewUser: data.is_new_user, user: sessionUser };
    } catch (error) {
      return {
        success: false,
        message: extractErrorMessage(error, 'Could not sign in with Apple. Please try again.'),
      };
    }
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  useEffect(() => {
    const handleUnauthorized = () => {
      const wasLoggedIn = Boolean(localStorage.getItem(SESSION_KEY));
      if (!wasLoggedIn) return;
      logout();
      showToast('Your session has expired. Please log in again.', 'error');
    };

    window.addEventListener('edrp:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('edrp:unauthorized', handleUnauthorized);
  }, []);

  const updateUser = (updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, loginWithGoogle, loginWithApple, logout, register, updateUser }}
    >
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

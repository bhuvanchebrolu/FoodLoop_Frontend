import React, { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userSettings, setUserSettings] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('foodloop_access_token');
    if (!token) {
      setUser(null);
      setUserSettings(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Failed to verify session token:', err);
      localStorage.removeItem('foodloop_access_token');
      localStorage.removeItem('foodloop_refresh_token');
      setUser(null);
      setUserSettings(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    if (!localStorage.getItem('foodloop_access_token')) return null;
    try {
      const settingsData = await userService.getSettings();
      setUserSettings(settingsData);
      return settingsData;
    } catch (err) {
      console.error('Failed to fetch user settings:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      setUser(result.user);
      setIsAuthenticated(true);
      fetchSettings();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(formData);
      setUser(result.user);
      setIsAuthenticated(true);
      fetchSettings();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setUserSettings(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    const result = await userService.updateProfile(profileData);
    if (result && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const updateSettings = async (settingsData) => {
    const result = await userService.updateSettings(settingsData);
    if (result && result.settings) {
      setUserSettings(result.settings);
    }
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userSettings,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        fetchSettings,
        updateProfile,
        updateSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

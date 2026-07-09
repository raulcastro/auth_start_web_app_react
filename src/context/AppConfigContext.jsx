import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchAppConfig,
  fetchWebAppConfig,
  fetchUserPreferences,
  getCurrentUser,
  isAuthenticated,
  getStoredUserPreferences,
  updateUserPreferences,
} from '../services/api';
import { firebaseLogout } from '../services/firebase';
import { createTheme } from '@mui/material/styles';

const AppConfigContext = createContext();

export { AppConfigContext };

export const AppConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [webAppConfig, setWebAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth state
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());

  // User preferences from API (with localStorage cache)
  const [userPreferences, setUserPreferences] = useState(() => getStoredUserPreferences());

  // Load public config, web config and user preferences on mount.
  useEffect(() => {
    const loadConfig = async () => {
      const data = await fetchAppConfig();
      setConfig(data);

      const webData = await fetchWebAppConfig();
      setWebAppConfig(webData);

      if (isAuthenticated()) {
        try {
          const prefs = await fetchUserPreferences();
          setUserPreferences(prefs);
          localStorage.setItem('user_preferences', JSON.stringify(prefs));
        } catch (error) {
          console.error('Failed to load user preferences:', error);
        }
      }

      setLoading(false);
    };
    loadConfig();
  }, []);

  // Update auth state helper
  const updateAuthState = useCallback(async (userData, token) => {
    if (userData && token) {
      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      try {
        const prefs = await fetchUserPreferences();
        setUserPreferences(prefs);
        localStorage.setItem('user_preferences', JSON.stringify(prefs));
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setUserPreferences({});
    }
  }, []);

  // Logout helper
  const logout = useCallback(async () => {
    try {
      await firebaseLogout();
    } catch {
      // Ignore errors if Firebase wasn't initialized
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_preferences');
    setUser(null);
    setIsLoggedIn(false);
    setUserPreferences({});
  }, []);

  // Helper function to check if a feature is enabled
  const isFeatureEnabled = useCallback((featureKey) => {
    const value = webAppConfig?.[featureKey]?.value;
    return value === true || value === '1' || value === 1 || value === 'true';
  }, [webAppConfig]);

  // Resolve system preference for auto theme
  const getSystemThemeMode = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }, []);

  // Resolve effective theme mode
  const themeMode = useMemo(() => {
    const canUserChange = isFeatureEnabled('features.user_theme_switch');
    const userMode = userPreferences['theme.mode']?.value;
    const configMode = webAppConfig?.['theme.mode']?.value || 'light';
    const effectiveMode = canUserChange && userMode ? userMode : configMode;

    return effectiveMode === 'auto' ? getSystemThemeMode() : effectiveMode;
  }, [isFeatureEnabled, userPreferences, webAppConfig, getSystemThemeMode]);

  // Resolve effective font size
  const fontSize = useMemo(() => {
    const canUserChange = isFeatureEnabled('features.user_font_size');

    if (canUserChange && userPreferences['typography.base_font_size']?.value) {
      return parseInt(userPreferences['typography.base_font_size'].value, 10);
    }

    const configFontSize = webAppConfig?.['typography.base_font_size']?.value;
    return configFontSize ? parseInt(configFontSize, 10) : 16;
  }, [isFeatureEnabled, userPreferences, webAppConfig]);

  // Resolve effective dense layout
  const isDense = useMemo(() => {
    const canUserChange = isFeatureEnabled('features.user_dense_layout');

    if (canUserChange && userPreferences['layout.dense']?.value !== undefined) {
      const value = userPreferences['layout.dense'].value;
      return value === '1' || value === true || value === 1 || value === 'true';
    }

    const configValue = webAppConfig?.['layout.dense']?.value;
    return configValue === '1' || configValue === true || configValue === 1 || configValue === 'true';
  }, [isFeatureEnabled, userPreferences, webAppConfig]);

  const getLoginGradient = useCallback(() => {
    const start = webAppConfig?.['theme.login_gradient_start']?.value || '#667eea';
    const end = webAppConfig?.['theme.login_gradient_end']?.value || '#764ba2';
    return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  }, [webAppConfig]);

  // Create dynamic MUI theme
  const theme = useMemo(() => {
    const primaryColor = webAppConfig?.['theme.primary_color']?.value || '#1976d2';
    const secondaryColor = webAppConfig?.['theme.secondary_color']?.value || '#dc004e';
    const fontFamily = webAppConfig?.['typography.font_family']?.value || 'Roboto';
    const validFontSize = typeof fontSize === 'number' && !isNaN(fontSize) ? fontSize : 16;

    return createTheme({
      palette: {
        mode: themeMode,
        primary: { main: primaryColor },
        secondary: { main: secondaryColor },
        background: {
          default: themeMode === 'dark' ? '#121212' : '#f5f5f5',
          paper: themeMode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: `"${fontFamily}", "Roboto", "Helvetica", "Arial", sans-serif`,
        fontSize: validFontSize,
      },
      spacing: isDense ? 4 : 8,
    });
  }, [fontSize, isDense, themeMode, webAppConfig]);

  // Centralized preference save: updates backend, localStorage and React state.
  // localStorage is updated synchronously so a subsequent page reload sees the
  // latest values immediately (React state updates may be batched).
  const saveUserPreferences = useCallback(async (preferences) => {
    const response = await updateUserPreferences(preferences);
    const updated = response?.data?.data || {};

    const merged = { ...userPreferences };
    Object.keys(updated).forEach((key) => {
      const nextValue = updated[key];
      // Backend may return either { value, type, label, ... } or a plain value.
      if (nextValue && typeof nextValue === 'object' && 'value' in nextValue) {
        merged[key] = nextValue;
      } else {
        merged[key] = { ...(merged[key] || {}), value: nextValue };
      }
    });

    // Synchronous write so a reload right after this call reads the new data.
    localStorage.setItem('user_preferences', JSON.stringify(merged));
    setUserPreferences(merged);

    return response;
  }, [userPreferences]);

  // Save user theme preference
  const setUserTheme = useCallback(async (mode) => {
    const canUserChange = isFeatureEnabled('features.user_theme_switch');
    if (!canUserChange) return;
    await saveUserPreferences({ 'theme.mode': mode });
  }, [isFeatureEnabled, saveUserPreferences]);

  // Save user font size preference
  const setUserFontSizePreference = useCallback(async (size) => {
    const canUserChange = isFeatureEnabled('features.user_font_size');
    if (!canUserChange) return;
    await saveUserPreferences({ 'typography.base_font_size': size.toString() });
  }, [isFeatureEnabled, saveUserPreferences]);

  // Save user dense layout preference
  const setUserDenseLayoutPreference = useCallback(async (dense) => {
    const canUserChange = isFeatureEnabled('features.user_dense_layout');
    if (!canUserChange) return;
    await saveUserPreferences({ 'layout.dense': dense ? '1' : '0' });
  }, [isFeatureEnabled, saveUserPreferences]);

  // Auth method helpers
  const isAuthMethodEnabled = useCallback((method) => {
    const value = config?.[`auth.methods.${method}`];
    return value === true || value === '1' || value === 1 || value === 'true';
  }, [config]);

  const getAuthProvider = useCallback(() => {
    return config?.['auth.provider'] || 'database';
  }, [config]);

  const isFirebaseAuth = useCallback(() => {
    return getAuthProvider() === 'firebase';
  }, [getAuthProvider]);

  // Stable helper getters
  const getTitle = useCallback(() => config?.['app.title'] || 'AuthWebApp', [config]);
  const getSubtitle = useCallback(() => config?.['app.subtitle'] || 'Authentication System', [config]);
  const getLanguage = useCallback(() => config?.['app.language'] || 'en', [config]);
  const getLogos = useCallback(() => config?.logos || {}, [config]);
  const getLogo = useCallback((type = 'universal') => config?.logos?.[type]?.url || null, [config]);
  const getThemeModeValue = useCallback(() => themeMode, [themeMode]);
  const getFontSizeValue = useCallback(() => fontSize, [fontSize]);
  const getDenseLayoutValue = useCallback(() => isDense, [isDense]);
  const isSignupEnabled = useCallback(() => {
    const value = config?.['app.signup_enabled'];
    return value === true || value === '1' || value === 1 || value === 'true';
  }, [config]);

  const value = useMemo(() => ({
    config,
    webAppConfig,
    theme,
    loading,
    // Auth state
    user,
    setUser,
    isLoggedIn,
    updateAuthState,
    logout,
    // Helper getters
    getTitle,
    getSubtitle,
    getLanguage,
    getLogos,
    getLogo,
    getThemeMode: getThemeModeValue,
    getFontSize: getFontSizeValue,
    getDenseLayout: getDenseLayoutValue,
    getLoginGradient,
    // User preferences
    userPreferences,
    saveUserPreferences,
    setUserTheme,
    setUserFontSizePreference,
    setUserDenseLayoutPreference,
    // Check if signup is enabled
    isSignupEnabled,
    // Auth methods
    isAuthMethodEnabled,
    getAuthProvider,
    isFirebaseAuth,
  }), [
    config,
    webAppConfig,
    theme,
    loading,
    user,
    setUser,
    isLoggedIn,
    updateAuthState,
    logout,
    getTitle,
    getSubtitle,
    getLanguage,
    getLogos,
    getLogo,
    getThemeModeValue,
    getFontSizeValue,
    getDenseLayoutValue,
    getLoginGradient,
    userPreferences,
    saveUserPreferences,
    setUserTheme,
    setUserFontSizePreference,
    setUserDenseLayoutPreference,
    isSignupEnabled,
    isAuthMethodEnabled,
    getAuthProvider,
    isFirebaseAuth,
  ]);

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};


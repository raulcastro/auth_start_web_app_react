import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fetchAppConfig, fetchWebAppConfig, fetchUserPreferences, getCurrentUser, isAuthenticated, getStoredUserPreferences, updateUserPreferences } from '../services/api';
import { createTheme } from '@mui/material/styles';

const AppConfigContext = createContext();

export const AppConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [webAppConfig, setWebAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth state
  const [user, setUser] = useState(() => getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated());
  
  // User preferences from API (with localStorage cache)
  const [userPreferences, setUserPreferences] = useState(() => {
    // Load from localStorage first for fast initial render
    return getStoredUserPreferences();
  });

  // Custom setter that also saves to localStorage
  const updateUserPreferencesState = (newPrefs) => {
    setUserPreferences(prev => {
      const updated = typeof newPrefs === 'function' ? newPrefs(prev) : newPrefs;
      // Save to localStorage
      localStorage.setItem('user_preferences', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const loadConfig = async () => {
      const data = await fetchAppConfig();
      setConfig(data);
      
      // Load web app config separately
      const webData = await fetchWebAppConfig();
      setWebAppConfig(webData);
      
      // Load user preferences if authenticated
      if (isAuthenticated()) {
        try {
          const prefs = await fetchUserPreferences();
          setUserPreferences(prefs);
        } catch (error) {
          console.error('Failed to load user preferences:', error);
        }
      }
      
      setLoading(false);
    };
    loadConfig();
  }, []);

  // Update auth state helper
  const updateAuthState = async (userData, token) => {
    if (userData && token) {
      setUser(userData);
      setIsLoggedIn(true);
      
      // Load user preferences after login
      try {
        const prefs = await fetchUserPreferences();
        setUserPreferences(prefs);
      } catch (error) {
        console.error('Failed to load user preferences:', error);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
      setUserPreferences({});
    }
  };

  // Logout helper
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_preferences');
    setUser(null);
    setIsLoggedIn(false);
    setUserPreferences({});
  };

  // Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureKey) => {
    const value = webAppConfig?.[featureKey]?.value;
    return value === true || value === '1' || value === 1 || value === 'true';
  };

  // Get effective theme mode (user preference > admin config > MUI default)
  const getThemeMode = () => {
    // Check if user can change theme
    const canUserChange = isFeatureEnabled('features.user_theme_switch');
    
    if (canUserChange && userPreferences['theme.mode']?.value) {
      return userPreferences['theme.mode'].value;
    }
    
    // Fall back to admin config
    return webAppConfig?.['theme.mode']?.value || 'light';
  };

  // Get effective font size
  const getFontSize = () => {
    const canUserChange = isFeatureEnabled('features.user_font_size');
    
    if (canUserChange && userPreferences['typography.base_font_size']?.value) {
      return parseInt(userPreferences['typography.base_font_size'].value, 10);
    }
    
    // Fall back to admin config, then MUI default (16)
    const configFontSize = webAppConfig?.['typography.base_font_size']?.value;
    return configFontSize ? parseInt(configFontSize, 10) : 16;
  };

  // Get effective dense layout (user preference > admin config > MUI default)
  const getDenseLayout = () => {
    const canUserChange = isFeatureEnabled('features.user_dense_layout');
    
    if (canUserChange && userPreferences['layout.dense']?.value !== undefined) {
      const value = userPreferences['layout.dense'].value;
      return value === '1' || value === true || value === 1 || value === 'true';
    }
    
    // Fall back to admin config
    const configValue = webAppConfig?.['layout.dense']?.value;
    return configValue === '1' || configValue === true || configValue === 1 || configValue === 'true';
  };
  const getLoginGradient = () => {
    const start = webAppConfig?.['theme.login_gradient_start']?.value || '#667eea';
    const end = webAppConfig?.['theme.login_gradient_end']?.value || '#764ba2';
    return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  };

  // Create dynamic MUI theme
  const theme = useMemo(() => {
    const mode = getThemeMode();
    const fontSize = getFontSize();
    const isDense = getDenseLayout();
    const primaryColor = webAppConfig?.['theme.primary_color']?.value || '#1976d2';
    const secondaryColor = webAppConfig?.['theme.secondary_color']?.value || '#dc004e';
    const fontFamily = webAppConfig?.['typography.font_family']?.value || 'Roboto';

    // Ensure fontSize is a valid number
    const validFontSize = typeof fontSize === 'number' && !isNaN(fontSize) ? fontSize : 16;

    return createTheme({
      palette: {
        mode,
        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#f5f5f5',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: `"${fontFamily}", "Roboto", "Helvetica", "Arial", sans-serif`,
        fontSize: validFontSize,
      },
      spacing: isDense ? 4 : 8,
    });
  }, [webAppConfig, userPreferences]);

  // Save user theme preference
  const setUserTheme = async (mode) => {
    const canUserChange = isFeatureEnabled('features.user_theme_switch');
    if (canUserChange) {
      try {
        await updateUserPreferences({ 'theme.mode': mode });
        updateUserPreferencesState(prev => ({
          ...prev,
          'theme.mode': { ...prev['theme.mode'], value: mode }
        }));
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  // Save user font size preference
  const setUserFontSizePreference = async (size) => {
    const canUserChange = isFeatureEnabled('features.user_font_size');
    if (canUserChange) {
      try {
        await updateUserPreferences({ 'typography.base_font_size': size.toString() });
        updateUserPreferencesState(prev => ({
          ...prev,
          'typography.base_font_size': { ...prev['typography.base_font_size'], value: size.toString() }
        }));
      } catch (error) {
        console.error('Failed to save font size preference:', error);
      }
    }
  };

  // Save user dense layout preference
  const setUserDenseLayoutPreference = async (dense) => {
    const canUserChange = isFeatureEnabled('features.user_dense_layout');
    if (canUserChange) {
      try {
        await updateUserPreferences({ 'layout.dense': dense ? '1' : '0' });
        updateUserPreferencesState(prev => ({
          ...prev,
          'layout.dense': { ...prev['layout.dense'], value: dense ? '1' : '0' }
        }));
      } catch (error) {
        console.error('Failed to save dense layout preference:', error);
      }
    }
  };

  const value = {
    config,
    webAppConfig,
    theme,
    loading,
    // Auth state
    user,
    isLoggedIn,
    updateAuthState,
    logout,
    // Helper getters
    getTitle: () => config?.['app.title'] || 'AuthWebApp',
    getSubtitle: () => config?.['app.subtitle'] || 'Authentication System',
    getLanguage: () => config?.['app.language'] || 'en',
    getLogos: () => config?.logos || {},
    getLogo: (type = 'universal') => config?.logos?.[type]?.url || null,
    getThemeMode,
    getFontSize,
    getDenseLayout,
    getLoginGradient,
    // User preferences
    userPreferences,
    setUserTheme,
    setUserFontSizePreference,
    setUserDenseLayoutPreference,
    // Check if signup is enabled
    isSignupEnabled: () => config?.['app.signup_enabled'] === true || config?.['app.signup_enabled'] === '1' || config?.['app.signup_enabled'] === 1,
  };

  return (
    <AppConfigContext.Provider value={value}>
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { fetchAppConfig, fetchWebAppConfig } from '../services/api';
import { createTheme } from '@mui/material/styles';

const AppConfigContext = createContext();

export const AppConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [webAppConfig, setWebAppConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // User preferences (stored in localStorage)
  const [userThemeMode, setUserThemeMode] = useState(() => {
    return localStorage.getItem('user_theme_mode') || null;
  });
  const [userFontSize, setUserFontSize] = useState(() => {
    const saved = localStorage.getItem('user_font_size');
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    const loadConfig = async () => {
      const data = await fetchAppConfig();
      setConfig(data);
      
      // Load web app config separately
      const webData = await fetchWebAppConfig();
      setWebAppConfig(webData);
      
      setLoading(false);
    };
    loadConfig();
  }, []);

  // Get effective theme mode (user preference > admin config > default)
  const getThemeMode = () => {
    // Check if user can change theme
    const canUserChange = webAppConfig?.['features.user_theme_switch']?.value !== false;
    
    if (canUserChange && userThemeMode) {
      return userThemeMode;
    }
    
    return webAppConfig?.['theme.mode']?.value || 'light';
  };

  // Get effective font size
  const getFontSize = () => {
    const canUserChange = webAppConfig?.['features.user_font_size']?.value !== false;
    
    if (canUserChange && userFontSize) {
      return parseInt(userFontSize, 10);
    }
    
    const configFontSize = webAppConfig?.['typography.base_font_size']?.value;
    return configFontSize ? parseInt(configFontSize, 10) : 16;
  };

  // Get login gradient colors
  const getLoginGradient = () => {
    const start = webAppConfig?.['theme.login_gradient_start']?.value || '#667eea';
    const end = webAppConfig?.['theme.login_gradient_end']?.value || '#764ba2';
    return `linear-gradient(135deg, ${start} 0%, ${end} 100%)`;
  };

  // Create dynamic MUI theme
  const theme = useMemo(() => {
    const mode = getThemeMode();
    const fontSize = getFontSize();
    const primaryColor = webAppConfig?.['theme.primary_color']?.value || '#1976d2';
    const secondaryColor = webAppConfig?.['theme.secondary_color']?.value || '#dc004e';
    const fontFamily = webAppConfig?.['typography.font_family']?.value || 'Roboto';
    const isDense = webAppConfig?.['layout.dense']?.value === true || webAppConfig?.['layout.dense']?.value === '1' || webAppConfig?.['layout.dense']?.value === 1;

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
  }, [webAppConfig, userThemeMode, userFontSize]);

  // Save user theme preference
  const setUserTheme = (mode) => {
    const canUserChange = webAppConfig?.['features.user_theme_switch']?.value !== false;
    if (canUserChange) {
      setUserThemeMode(mode);
      localStorage.setItem('user_theme_mode', mode);
    }
  };

  // Save user font size preference
  const setUserFontSizePreference = (size) => {
    const canUserChange = webAppConfig?.['features.user_font_size']?.value !== false;
    if (canUserChange) {
      setUserFontSize(size);
      localStorage.setItem('user_font_size', size.toString());
    }
  };

  const value = {
    config,
    webAppConfig,
    theme,
    loading,
    // Helper getters
    getTitle: () => config?.['app.title'] || 'AuthWebApp',
    getSubtitle: () => config?.['app.subtitle'] || 'Authentication System',
    getLanguage: () => config?.['app.language'] || 'en',
    getLogos: () => config?.logos || {},
    getLogo: (type = 'universal') => config?.logos?.[type]?.url || null,
    getThemeMode,
    getFontSize,
    getLoginGradient,
    // User preferences
    userThemeMode,
    userFontSize,
    setUserTheme,
    setUserFontSizePreference,
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

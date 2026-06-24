import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAppConfig } from '../services/api';

const AppConfigContext = createContext();

export const AppConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      const data = await fetchAppConfig();
      setConfig(data);
      setLoading(false);
    };
    loadConfig();
  }, []);

  const value = {
    config,
    loading,
    // Helper getters
    getTitle: () => config?.['app.title'] || 'AuthWebApp',
    getSubtitle: () => config?.['app.subtitle'] || 'Authentication System',
    getLanguage: () => config?.['app.language'] || 'en',
    getLogos: () => config?.logos || {},
    getLogo: (type = 'universal') => config?.logos?.[type]?.url || null,
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

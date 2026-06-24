const API_BASE_URL = 'http://127.0.0.1:8000/api';
const STORAGE_BASE_URL = 'http://127.0.0.1:8000';

/**
 * Fetch public app configuration from API
 */
export const fetchAppConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    const data = await response.json();
    
    // Process logos to ensure full URLs
    if (data.data && data.data.logos) {
      data.data.logos = processLogos(data.data.logos);
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching app config:', error);
    // Return default config if API fails
    return {
      'app.title': 'AuthWebApp',
      'app.subtitle': 'Authentication System',
      'app.language': 'en',
      logos: {},
      web_app: getDefaultWebAppConfig(),
    };
  }
};

/**
 * Fetch Web App Config only
 */
export const fetchWebAppConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/web-config`);
    if (!response.ok) {
      throw new Error('Failed to fetch web app config');
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching web app config:', error);
    return getDefaultWebAppConfig();
  }
};

/**
 * Fetch active logos from API
 */
export const fetchLogos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/logos`);
    if (!response.ok) {
      throw new Error('Failed to fetch logos');
    }
    const data = await response.json();
    return processLogos(data.data);
  } catch (error) {
    console.error('Error fetching logos:', error);
    return {};
  }
};

/**
 * Process logos to ensure full URLs
 */
const processLogos = (logos) => {
  if (!logos) return {};
  
  const processedLogos = {};
  
  for (const [type, logo] of Object.entries(logos)) {
    if (logo && logo.url) {
      // If URL is relative, prepend the storage base URL
      const fullUrl = logo.url.startsWith('http') 
        ? logo.url 
        : `${STORAGE_BASE_URL}${logo.url}`;
      
      processedLogos[type] = {
        ...logo,
        url: fullUrl,
      };
    }
  }
  
  return processedLogos;
};

/**
 * Default Web App Config
 */
const getDefaultWebAppConfig = () => ({
  'theme.mode': { value: 'light', is_editable_by_user: true },
  'theme.primary_color': { value: '#1976d2', is_editable_by_user: false },
  'theme.secondary_color': { value: '#dc004e', is_editable_by_user: false },
  'theme.login_gradient_start': { value: '#667eea', is_editable_by_user: false },
  'theme.login_gradient_end': { value: '#764ba2', is_editable_by_user: false },
  'typography.base_font_size': { value: 16, is_editable_by_user: true },
  'typography.font_family': { value: 'Roboto', is_editable_by_user: true },
  'layout.dense': { value: false, is_editable_by_user: true },
  'features.user_theme_switch': { value: true, is_editable_by_user: false },
  'features.user_font_size': { value: true, is_editable_by_user: false },
});

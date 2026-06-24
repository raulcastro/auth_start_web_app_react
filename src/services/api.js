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
    };
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

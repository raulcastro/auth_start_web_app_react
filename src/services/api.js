const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
    return data.data;
  } catch (error) {
    console.error('Error fetching logos:', error);
    return {};
  }
};

import apiClient from './apiClient';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
export const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Standardize a backend error into a plain Error with a useful message.
 */
const normalizeError = (error, fallback = 'Request failed') => {
  const message = error.response?.data?.message
    || error.message
    || fallback;

  const err = new Error(message);
  err.status = error.response?.status;
  err.errors = error.response?.data?.errors || null;
  err.code = error.response?.data?.error_code || null;
  return err;
};

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
 * Register a new user
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw Object.assign(new Error(data.message || 'Registration failed'), {
        status: response.status,
        errors: data.errors || null,
        code: data.error_code || null,
      });
    }

    // Persist token locally for consistency with login
    if (data.data && data.data.token) {
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw Object.assign(new Error(data.message || 'Login failed'), {
        status: response.status,
        errors: data.errors || null,
        code: data.error_code || null,
      });
    }

    // Store token
    if (data.data && data.data.token) {
      localStorage.setItem('auth_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await apiClient.post('/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_preferences');
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Fetch authenticated user profile from API
 */
export const fetchProfile = async () => {
  try {
    const response = await apiClient.get('/me');
    return response.data.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to fetch profile');
  }
};

/**
 * Update authenticated user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/me', profileData);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to update profile');
  }
};

/**
 * Upload or replace the authenticated user's avatar
 */
export const uploadAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post('/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to upload avatar');
  }
};

/**
 * Fetch user preferences from API
 */
export const fetchUserPreferences = async () => {
  try {
    const response = await apiClient.get('/user/preferences');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return {};
  }
};

/**
 * Update user preferences.
 * Returns the full preference objects (value, type, label, etc.).
 */
export const updateUserPreferences = async (preferences) => {
  try {
    const response = await apiClient.put('/user/preferences', preferences);
    return response.data;
  } catch (error) {
    throw normalizeError(error, 'Failed to update preferences');
  }
};

/**
 * Get user preferences from localStorage (fast)
 */
export const getStoredUserPreferences = () => {
  try {
    return JSON.parse(localStorage.getItem('user_preferences') || '{}');
  } catch {
    return {};
  }
};

/**
 * Clear stored user preferences
 */
export const clearStoredUserPreferences = () => {
  localStorage.removeItem('user_preferences');
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
